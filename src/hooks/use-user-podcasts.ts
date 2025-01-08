import useReplaceableEvent from "./use-replaceable-event";
import useCurrentAccount from "./use-current-account";
import { RequestOptions } from "../services/replaceable-events";
import { PODCASTS_LIST_KIND } from "../helpers/nostr/podcasts";

export default function useUserPodcasts(
  pubkey?: string,
  additionalRelays?: Iterable<string>,
  opts: RequestOptions = {},
) {
  const account = useCurrentAccount();
  pubkey = pubkey || account?.pubkey;

  return useReplaceableEvent(pubkey ? { kind: PODCASTS_LIST_KIND, pubkey } : undefined, additionalRelays, opts);
}