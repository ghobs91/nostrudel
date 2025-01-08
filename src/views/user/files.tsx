import { Link, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { getTagValue } from "applesauce-core/helpers";
import { useOutletContext, Link as RouterLink } from "react-router-dom";
import { kinds } from "nostr-tools";

import useTimelineLoader from "../../hooks/use-timeline-loader";
import { useAdditionalRelayContext } from "../../providers/local/additional-relay-context";
import { useTimelineCurserIntersectionCallback } from "../../hooks/use-timeline-cursor-intersection-callback";
import IntersectionObserverProvider from "../../providers/local/intersection-observer";
import VerticalPageLayout from "../../components/vertical-page-layout";
import TimelineActionAndStatus from "../../components/timeline/timeline-action-and-status";
import { NostrEvent } from "../../types/nostr-event";
import Timestamp from "../../components/timestamp";
import useEventIntersectionRef from "../../hooks/use-event-intersection-ref";
import { formatBytes } from "../../helpers/number";
import useShareableEventAddress from "../../hooks/use-shareable-event-address";

function FileRow({ file }: { file: NostrEvent }) {
  const ref = useEventIntersectionRef<HTMLTableRowElement>(file);
  const name = getTagValue(file, "name") || getTagValue(file, "summary") || "Unknown";
  const type = getTagValue(file, "m");
  const size = getTagValue(file, "size");

  const nevent = useShareableEventAddress(file);

  return (
    <Tr ref={ref}>
      <Td maxW="xs">
        <Link as={RouterLink} to={`/files/${nevent}`}>
          {name}
        </Link>
      </Td>
      <Td>{type}</Td>
      <Td>{size && formatBytes(parseInt(size))}</Td>
      <Td isNumeric>
        <Timestamp timestamp={file.created_at} />
      </Td>
    </Tr>
  );
}

export default function UserFilesTab() {
  const { pubkey } = useOutletContext() as { pubkey: string };
  const readRelays = useAdditionalRelayContext();

  const { loader, timeline: files } = useTimelineLoader(pubkey + "-files", readRelays, [
    {
      authors: [pubkey],
      kinds: [kinds.FileMetadata],
    },
  ]);
  const callback = useTimelineCurserIntersectionCallback(loader);

  return (
    <IntersectionObserverProvider callback={callback}>
      <VerticalPageLayout>
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Type</Th>
                <Th>Size</Th>
                <Th isNumeric>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {files.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <TimelineActionAndStatus timeline={loader} />
      </VerticalPageLayout>
    </IntersectionObserverProvider>
  );
}