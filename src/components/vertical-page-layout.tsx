import { Box, ComponentWithAs, Flex, FlexProps } from "@chakra-ui/react";
import useScrollRestoreRef from "../hooks/use-scroll-restore";

const VerticalPageLayout: ComponentWithAs<"div", FlexProps> = ({ children, ...props }: FlexProps) => {
  const ref = useScrollRestoreRef();

  return (
    <Box overflowX="hidden" overflowY="auto" h="full" w="full" mt="var(--safe-top)" ref={ref}>
      <Flex direction="column" pt="2" pb="12" gap="2" px="2" w="full" {...props}>
        {children}
      </Flex>
    </Box>
  );
};

export default VerticalPageLayout;
