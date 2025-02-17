import { useCallback, useMemo } from "react";
import { Card, CardBody, Flex, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { kinds, nip19 } from "nostr-tools";

import UserAvatar from "../../components/user/user-avatar";
import RequireActiveAccount from "../../components/router/require-active-account";
import Timestamp from "../../components/timestamp";
import PeopleListSelection from "../../components/people-list-selection/people-list-selection";
import PeopleListProvider, { usePeopleListContext } from "../../providers/local/people-list-provider";
import { useActiveAccount } from "applesauce-react/hooks";
import { KnownConversation, groupIntoConversations, hasResponded, identifyConversation } from "../../helpers/nostr/dms";
import IntersectionObserverProvider from "../../providers/local/intersection-observer";
import { useTimelineCurserIntersectionCallback } from "../../hooks/use-timeline-cursor-intersection-callback";
import TimelineActionAndStatus from "../../components/timeline/timeline-action-and-status";
import UserName from "../../components/user/user-name";
import { NostrEvent } from "../../types/nostr-event";
import { CheckIcon } from "../../components/icons";
import UserDnsIdentity from "../../components/user/user-dns-identity";
import useEventIntersectionRef from "../../hooks/use-event-intersection-ref";
import { useKind4Decrypt } from "../../hooks/use-kind4-decryption";
import ContainedParentView from "../../components/layout/presets/contained-parent-view";
import { truncateId } from "../../helpers/string";
import useTimelineLoader from "../../hooks/use-timeline-loader";
import useUserMailboxes from "../../hooks/use-user-mailboxes";
import useClientSideMuteFilter from "../../hooks/use-client-side-mute-filter";

export function useDirectMessagesTimeline(pubkey?: string) {
  const userMuteFilter = useClientSideMuteFilter();
  const eventFilter = useCallback(
    (event: NostrEvent) => {
      if (userMuteFilter(event)) return false;
      return true;
    },
    [userMuteFilter],
  );
  const mailboxes = useUserMailboxes(pubkey);

  return useTimelineLoader(
    `${truncateId(pubkey ?? "anon")}-dms`,
    mailboxes?.inboxes ?? [],
    pubkey
      ? [
          { authors: [pubkey], kinds: [kinds.EncryptedDirectMessage] },
          { "#p": [pubkey], kinds: [kinds.EncryptedDirectMessage] },
        ]
      : undefined,
    { eventFilter },
  );
}

function MessagePreview({ message, pubkey }: { message: NostrEvent; pubkey: string }) {
  const ref = useEventIntersectionRef(message);

  const { plaintext } = useKind4Decrypt(message);
  return (
    <Text isTruncated ref={ref}>
      {plaintext || "<Encrypted>"}
    </Text>
  );
}

function ConversationCard({ conversation }: { conversation: KnownConversation }) {
  const location = useLocation();
  const lastReceived = conversation.messages.find((m) => m.pubkey === conversation.correspondent);
  const lastMessage = conversation.messages[0];

  const ref = useEventIntersectionRef(lastMessage);

  return (
    <LinkBox as={Card} size="sm" ref={ref}>
      <CardBody display="flex" gap="2" overflow="hidden">
        <UserAvatar pubkey={conversation.correspondent} />
        <Flex direction="column" gap="1" overflow="hidden" flex={1}>
          <Flex gap="2" alignItems="center" overflow="hidden">
            <UserName pubkey={conversation.correspondent} isTruncated />
            <UserDnsIdentity onlyIcon pubkey={conversation.correspondent} />
            <Timestamp flexShrink={0} timestamp={lastMessage.created_at} ml="auto" />
            {hasResponded(conversation) && <CheckIcon boxSize={4} color="green.500" />}
          </Flex>
          {lastReceived && <MessagePreview message={lastReceived} pubkey={lastReceived.pubkey} />}
        </Flex>
      </CardBody>
      <LinkOverlay as={RouterLink} to={`/messages/${nip19.npubEncode(conversation.correspondent)}` + location.search} />
    </LinkBox>
  );
}

function MessagesHomePage() {
  const { people } = usePeopleListContext();

  const account = useActiveAccount()!;
  const { timeline: messages, loader } = useDirectMessagesTimeline(account.pubkey);

  const conversations = useMemo(() => {
    const conversations = groupIntoConversations(messages).map((c) => identifyConversation(c, account.pubkey));
    const filtered = conversations.filter((conversation) =>
      people ? people.some((p) => p.pubkey === conversation.correspondent) : true,
    );

    return filtered.sort((a, b) => b.messages[0].created_at - a.messages[0].created_at);
  }, [messages, people, account.pubkey]);

  const callback = useTimelineCurserIntersectionCallback(loader);

  return (
    <ContainedParentView path="/messages" width="md">
      <Flex gap="2">
        <PeopleListSelection flexShrink={0} size="sm" />
      </Flex>
      <IntersectionObserverProvider callback={callback}>
        {conversations.map((conversation) => (
          <ConversationCard key={conversation.pubkeys.join("-")} conversation={conversation} />
        ))}
      </IntersectionObserverProvider>
      <TimelineActionAndStatus loader={loader} />
    </ContainedParentView>
  );
}

export default function MessagesHomeView() {
  return (
    <RequireActiveAccount>
      <PeopleListProvider initList="global">
        <MessagesHomePage />
      </PeopleListProvider>
    </RequireActiveAccount>
  );
}
