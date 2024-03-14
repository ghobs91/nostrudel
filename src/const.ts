import { safeRelayUrl, safeRelayUrls } from "./helpers/relay";

export const SEARCH_RELAYS = safeRelayUrls([
  "wss://relay.nostr.band",
  "wss://search.nos.today",
  "wss://relay.noswhere.com",
  "wss://saltivka.org",
  "wss://bostr.yonle.lecturify.net",
  "wss://relay.roli.social",
  "wss://nostr-relay.app"
];
export const COMMON_CONTACT_RELAY = "wss://purplepag.es";
