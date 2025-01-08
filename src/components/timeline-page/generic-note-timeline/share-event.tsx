import { memo } from "react";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { kinds, nip18 } from "nostr-tools";

import { NostrEvent } from "../../../types/nostr-event";
import TimelineNote from "../../note/timeline-note";
import UserAvatar from "../../user/user-avatar";
import UserDnsIdentity from "../../user/user-dns-identity";
import UserLink from "../../user/user-link";
import { TrustProvider } from "../../../providers/local/trust-provider";
import useSingleEvent from "../../../hooks/use-single-event";
import { EmbedEvent } from "../../embed-event";
import useUserMuteFilter from "../../../hooks/use-user-mute-filter";
import { parseHardcodedNoteContent } from "../../../helpers/nostr/event";
import LoadingNostrLink from "../../loading-nostr-link";
import NoteMenu from "../../note/note-menu";
import useEventIntersectionRef from "../../../hooks/use-event-intersection-ref";

function ShareEvent({ event }: { event: NostrEvent }) {
  const muteFilter = useUserMuteFilter();
  const hardCodedNote = parseHardcodedNoteContent(event);

  const pointer = nip18.getRepostedEventPointer(event);
  const loadedNote = useSingleEvent(pointer?.id, pointer?.relays);
  const note = hardCodedNote || loadedNote;

  const ref = useEventIntersectionRef(event);

  if ((note && muteFilter(note)) || !pointer) return null;

  return (
    <TrustProvider event={event}>
      <Flex gap="2" direction="column" ref={ref}>
        <Flex gap="2" alignItems="center" pl="1">
          <UserAvatar pubkey={event.pubkey} size="xs" />
          <Heading size="sm" display="inline" isTruncated whiteSpace="pre">
            <UserLink pubkey={event.pubkey} />
          </Heading>
          <UserDnsIdentity pubkey={event.pubkey} onlyIcon />
          <Text as="span">Shared</Text>
          <NoteMenu event={event} size="sm" variant="link" aria-label="note options" ml="auto" />
        </Flex>
        {!note ? (
          <LoadingNostrLink link={{ type: "nevent", data: pointer }} />
        ) : note.kind === kinds.ShortTextNote ? (
          // NOTE: tell the note not to register itself with the intersection observer. since this is an older note it will break the order of the timeline
          <TimelineNote event={note} showReplyButton registerIntersectionEntity={false} />
        ) : (
          <EmbedEvent event={note} />
        )}
      </Flex>
    </TrustProvider>
  );
}

export default memo(ShareEvent);