import { Button, Card, CardBody, CardHeader, CardProps, Flex, Text } from "@chakra-ui/react";
import { useStoreQuery } from "applesauce-react/hooks";
import { WalletBalanceQuery } from "applesauce-wallet/queries";
import { ECashIcon } from "../../components/icons";
import useReplaceableEvent from "../../hooks/use-replaceable-event";
import { WALLET_KIND } from "applesauce-wallet/helpers";
import useEventUpdate from "../../hooks/use-event-update";
import QRCodeScannerButton from "../../components/qr-code/qr-code-scanner-button";
import RouterLink from "../../components/router-link";

export default function WalletBalanceCard({ pubkey, ...props }: { pubkey: string } & Omit<CardProps, "children">) {
  const wallet = useReplaceableEvent({ kind: WALLET_KIND, pubkey });
  useEventUpdate(wallet?.id);

  const balance = useStoreQuery(WalletBalanceQuery, [pubkey]);

  return (
    <Card {...props}>
      <CardHeader gap="4" display="flex" justifyContent="center" alignItems="center" pt="10">
        <ECashIcon color="green.400" boxSize={12} />
        <Text fontWeight="bold" fontSize="4xl">
          {balance ? Object.values(balance).reduce((t, v) => t + v, 0) : "--Locked--"}
        </Text>
      </CardHeader>
      <CardBody>
        <Flex gap="2" w="full">
          <Button isDisabled w="full" size="lg">
            Send
          </Button>
          <QRCodeScannerButton onData={() => {}} isDisabled size="lg" />
          <Button as={RouterLink} w="full" size="lg" to="/wallet/receive">
            Receive
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
}
