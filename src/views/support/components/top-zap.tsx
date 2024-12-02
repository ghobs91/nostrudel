import { Card, CardBody, CardHeader, Flex, Spacer, Text } from "@chakra-ui/react";
import { getZapPayment, getZapRequest, getZapSender } from "applesauce-core/helpers";
import { NostrEvent } from "nostr-tools";

import UserAvatar from "../../../components/user/user-avatar";
import UserLink from "../../../components/user/user-link";
import TextNoteContents from "../../../components/note/timeline-note/text-note-contents";
import { LightningIcon } from "../../../components/icons";
import Timestamp from "../../../components/timestamp";
import DebugEventButton from "../../../components/debug-modal/debug-event-button";
import useEventIntersectionRef from "../../../hooks/use-event-intersection-ref";
import { TrustProvider } from "../../../providers/local/trust-provider";

export function TopZap({ zap }: { zap: NostrEvent }) {
  const sender = getZapSender(zap);
  const request = getZapRequest(zap);
  const payment = getZapPayment(zap);

  const ref = useEventIntersectionRef(zap);

  return (
    <Card maxW="2xl" w="full" mt="6rem" ref={ref} borderColor="purple.500" variant="outline">
      <CardHeader display="grid" gap="2" gridTemplateColumns="1fr 1fr 1fr" p="4" alignItems="center">
        <Flex gap="2">
          <LightningIcon color="yellow.400" boxSize={6} />
          {payment?.amount && (
            <Text color="purple.500" fontSize="xl" fontWeight="bold">
              {(payment.amount / 1000).toLocaleString()}
            </Text>
          )}
        </Flex>
        <Flex gap="2" flexDirection="column" alignItems="center">
          <UserAvatar pubkey={sender} mt="-6rem" size="xl" />
          <UserLink pubkey={sender} fontWeight="bold" fontSize="xl" />
        </Flex>

        <Flex justifyContent="flex-end" gap="2">
          <Timestamp timestamp={zap.created_at} />
          <DebugEventButton event={zap} size="xs" variant="ghost" />
        </Flex>
      </CardHeader>

      {request.content && (
        <CardBody px="4" pt="0" pb="4">
          <TrustProvider event={request}>
            <TextNoteContents event={request} fontSize="lg" />
          </TrustProvider>
        </CardBody>
      )}
    </Card>
  );
}