import { Box, Button, Card, Flex, Heading, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAsync } from "react-use";
import { containerProps } from "../../../views/signup/common";

interface TrendingApi {
    content: string,
    id: string
};

// function About({ profile }: { profile: { content: string } }) {
//   const { value: metadata, error } = useAsync(
//     async () => JSON.parse(profile.content) as Kind0ParsedContent,
//     [profile.content],
//   );
//   return metadata ? <Text>{metadata.about}</Text> : null;
// }

export default function DiscoverView() {
  const trending = useAsync(async () => {
    return await fetch("https://mastodon.social/api/v1/trends/statuses").then((res) => res.json() as Promise<TrendingApi[]>);
  });

  const popularMastodon = async (): Promise <any[]> => {
    const res = await fetch("https://mastodon.social/api/v1/trends/statuses", {method: "get"})
    const json = await res.json()
    return json
  }

  const postArray: any[] = []

  popularMastodon().then((daArray) => {
    daArray.forEach((post) => {
        postArray.push(post)
    })

    // mastoArray.push(daArray);
  }).then(() => {
    console.log(`postArray: ${postArray[0].content}`)
    return (
        <Flex gap="4" {...containerProps} maxW="6in">
          <Heading>Follow a few others</Heading>
          <Flex overflowX="hidden" overflowY="scroll" minH="4in" maxH="6in" direction="column" gap="2" w="full">
            {postArray.map((post) => (
              <Card p="4" variant="outline" gap="2">
                <Flex direction="row" alignItems="center" gap="4">
                  {/* <UserAvatarLink pubkey={id} /> */}
                  <Flex direction="column" overflow="hidden">
                    {/* <UserLink pubkey={id} fontWeight="bold" fontSize="lg" isTruncated /> */}
                    {/* <UserDnsIdentityIcon pubkey={id} /> */}
                  </Flex>
                </Flex>
                {post.content}
              </Card>
            ))}
          </Flex>
          <Button as={RouterLink} to="/" colorScheme="primary" maxW="sm" w="full">
            Start exploring nostr
          </Button>
        </Flex>
      );
  })



}
