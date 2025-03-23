import { useToast } from "@chakra-ui/react";
import { DependencyList, useCallback, useRef, useState } from "react";

export default function useAsyncAction<Args extends Array<any>, T = any>(
  fn: (...args: Args) => Promise<T>,
  deps: DependencyList = [],
): { loading: boolean; run: (...args: Args) => Promise<T | undefined> } {
  const ref = useRef(fn);
  ref.current = fn;

  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const run = useCallback<(...args: Args) => Promise<T | undefined>>(async (...args: Args) => {
    setLoading(true);
    try {
      return await ref.current(...args);
    } catch (e) {
      if (e instanceof Error) toast({ description: e.message, status: "error" });
    }
    setLoading(false);
  }, deps);

  return { loading, run };
}
