import { ReactNode, forwardRef, memo, useMemo } from "react";
import { AvatarGroup, ButtonGroup, Flex, IconButton, IconButtonProps, Text, useDisclosure } from "@chakra-ui/react";
import { kinds, nip18, nip25 } from "nostr-tools";

import useCurrentAccount from "../../../hooks/use-current-account";
import { NostrEvent, isATag, isETag } from "../../../types/nostr-event";
import { getParsedZap } from "../../../helpers/nostr/zaps";
import { readablizeSats } from "../../../helpers/bolt11";
import { parseCoordinate } from "../../../helpers/nostr/event";
import { EmbedEvent, EmbedEventPointer } from "../../../components/embed-event";
import EmbeddedUnknown from "../../../components/embed-event/event-types/embedded-unknown";
import { ErrorBoundary } from "../../../components/error-boundary";
import { TrustProvider } from "../../../providers/local/trust-provider";
import Heart from "../../../components/icons/heart";
import UserAvatarLink from "../../../components/user/user-avatar-link";
import {
  AtIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightningIcon,
  ReplyIcon,
  RepostIcon,
} from "../../../components/icons";
import useSingleEvent from "../../../hooks/use-single-event";
import NotificationIconEntry from "./notification-icon-entry";
import { CategorizedEvent, NotificationType, typeSymbol } from "../../../classes/notifications";
import useEventIntersectionRef from "../../../hooks/use-event-intersection-ref";
import ZapReceiptMenu from "../../../components/zap/zap-receipt-menu";

export const ExpandableToggleButton = ({
  toggle,
  ...props
}: { toggle: { isOpen: boolean; onToggle: () => void } } & Omit<IconButtonProps, "icon">) => (
  <IconButton
    icon={toggle.isOpen ? <ChevronUpIcon boxSize={6} /> : <ChevronDownIcon boxSize={6} />}
    variant="ghost"
    onClick={toggle.onToggle}
    {...props}
  />
);

const ReplyNotification = forwardRef<HTMLDivElement, { event: NostrEvent }>(({ event }, ref) => (
  <NotificationIconEntry ref={ref} icon={<ReplyIcon boxSize={8} color="green.400" />}>
    <EmbedEvent event={event} />
  </NotificationIconEntry>
));

const MentionNotification = forwardRef<HTMLDivElement, { event: NostrEvent }>(({ event }, ref) => (
  <NotificationIconEntry ref={ref} icon={<AtIcon boxSize={8} color="purple.400" />}>
    <EmbedEvent event={event} />
  </NotificationIconEntry>
));

const RepostNotification = forwardRef<HTMLDivElement, { event: NostrEvent }>(({ event }, ref) => {
  const pointer = nip18.getRepostedEventPointer(event);
  const expanded = useDisclosure({ defaultIsOpen: true });
  if (!pointer) return null;

  return (
    <NotificationIconEntry ref={ref} icon={<RepostIcon boxSize={8} color="blue.400" />}>
      <Flex gap="2" alignItems="center">
        <AvatarGroup size="sm">
          <UserAvatarLink pubkey={event.pubkey} />
        </AvatarGroup>
        <ExpandableToggleButton aria-label="Toggle event" ml="auto" toggle={expanded} />
      </Flex>
      {expanded.isOpen && <EmbedEventPointer pointer={{ type: "nevent", data: pointer }} />}
    </NotificationIconEntry>
  );
});

const ReactionNotification = forwardRef<HTMLDivElement, { event: NostrEvent }>(({ event }, ref) => {
  const account = useCurrentAccount();
  const pointer = nip25.getReactedEventPointer(event);
  const expanded = useDisclosure({ defaultIsOpen: true });
  if (!pointer || (account?.pubkey && pointer.author !== account.pubkey)) return null;

  const reactedEvent = useSingleEvent(pointer.id, pointer.relays);
  if (reactedEvent?.kind === kinds.EncryptedDirectMessage) return null;

  return (
    <NotificationIconEntry ref={ref} icon={<Heart boxSize={8} color="red.400" />}>
      <Flex gap="2" alignItems="center">
        <AvatarGroup size="sm">
          <UserAvatarLink pubkey={event.pubkey} />
        </AvatarGroup>
        <Text fontSize="xl">{event.content}</Text>
        <ExpandableToggleButton aria-label="Toggle event" ml="auto" toggle={expanded} />
        {/* <Timestamp timestamp={event.created_at} ml="auto" /> */}
      </Flex>
      {expanded.isOpen && <EmbedEventPointer pointer={{ type: "nevent", data: pointer }} />}
    </NotificationIconEntry>
  );
});

const ZapNotification = forwardRef<HTMLDivElement, { event: NostrEvent }>(({ event }, ref) => {
  const zap = useMemo(() => getParsedZap(event), [event]);

  if (!zap || !zap.payment.amount) return null;

  const eventId = zap?.request.tags.find(isETag)?.[1];
  const coordinate = zap?.request.tags.find(isATag)?.[1];
  const parsedCoordinate = coordinate ? parseCoordinate(coordinate) : null;
  const expanded = useDisclosure({ defaultIsOpen: true });

  let eventJSX: ReactNode | null = null;
  if (parsedCoordinate && parsedCoordinate.identifier) {
    eventJSX = (
      <EmbedEventPointer
        pointer={{
          type: "naddr",
          data: {
            pubkey: parsedCoordinate.pubkey,
            identifier: parsedCoordinate.identifier,
            kind: parsedCoordinate.kind,
          },
        }}
      />
    );
  } else if (eventId) {
    eventJSX = <EmbedEventPointer pointer={{ type: "note", data: eventId }} />;
  }

  return (
    <NotificationIconEntry ref={ref} icon={<LightningIcon boxSize={8} color="yellow.400" />}>
      <Flex gap="2" alignItems="center">
        <AvatarGroup size="sm">
          <UserAvatarLink pubkey={zap.request.pubkey} />
        </AvatarGroup>
        <Text>{readablizeSats(zap.payment.amount / 1000)} sats</Text>
        {zap.request.content && <Text>{zap.request.content}</Text>}
        <ButtonGroup size="sm" variant="ghost" ml="auto">
          {eventJSX !== null && <ExpandableToggleButton aria-label="Toggle event" toggle={expanded} />}
          <ZapReceiptMenu zap={zap.event} aria-label="More Options" />
        </ButtonGroup>
      </Flex>
      {expanded.isOpen && eventJSX}
    </NotificationIconEntry>
  );
});

const NotificationItem = ({ event }: { event: CategorizedEvent }) => {
  const ref = useEventIntersectionRef(event);

  let content: ReactNode | null = null;
  switch (event[typeSymbol]) {
    case NotificationType.Reply:
      content = <ReplyNotification event={event} ref={ref} />;
      break;
    case NotificationType.Mention:
      content = <MentionNotification event={event} ref={ref} />;
      break;
    case NotificationType.Reaction:
      content = <ReactionNotification event={event} ref={ref} />;
      break;
    case NotificationType.Repost:
      content = <RepostNotification event={event} ref={ref} />;
      break;
    case NotificationType.Zap:
      content = <ZapNotification event={event} ref={ref} />;
      break;
    default:
      content = <EmbeddedUnknown event={event} />;
      break;
  }
  return (
    content && (
      <ErrorBoundary>
        <TrustProvider event={event}>{content}</TrustProvider>
      </ErrorBoundary>
    )
  );
};

export default memo(NotificationItem);
