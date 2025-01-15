import { BehaviorSubject, filter, mergeMap } from "rxjs";

import { logger } from "../helpers/debug";
import BakeryConnection from "../classes/bakery/bakery-connection";
import BakeryControlApi from "../classes/bakery/control-api";
import signingService from "./signing";
import accountService from "./account";
import relayPoolService from "./relay-pool";
import localSettings from "./local-settings";

const log = logger.extend("bakery");

export function setBakeryURL(url: string) {
  localSettings.bakeryURL.next(url);
}
export function clearBakeryURL() {
  localSettings.bakeryURL.clear();
}

export const bakery$ = new BehaviorSubject<BakeryConnection | null>(null);

localSettings.bakeryURL.subscribe((url) => {
  if (!URL.canParse(url)) return bakery$.next(null);

  try {
    const bakery = new BakeryConnection(localSettings.bakeryURL.value);

    // add the bakery to the relay pool and connect
    relayPoolService.relays.set(bakery.url, bakery);
    relayPoolService.requestConnect(bakery);

    bakery$.next(bakery);
  } catch (err) {
    log("Failed to create bakery connection, clearing storage");
    localSettings.bakeryURL.clear();
  }
});

// automatically authenticate with bakery
bakery$
  .pipe(
    filter((r) => r !== null),
    mergeMap((r) => r.onChallenge),
  )
  .subscribe(async () => {
    if (!bakery$.value) return;

    const account = accountService.current.value;
    if (!account) return;

    try {
      await bakery$.value.authenticate((draft) => signingService.requestSignature(draft, account));
    } catch (err) {
      console.log("Failed to authenticate with bakery", err);
    }
  });

export const controlApi$ = new BehaviorSubject<BakeryControlApi | null>(null);

// create a control api for the bakery
bakery$.subscribe((relay) => {
  if (!relay) return controlApi$.next(null);
  else controlApi$.next(new BakeryControlApi(relay));
});

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.bakery = bakery$;
  // @ts-expect-error
  window.controlApi = controlApi$;
}

export function getControlApi() {
  return controlApi$.value;
}
export function getBakery() {
  return bakery$.value;
}
