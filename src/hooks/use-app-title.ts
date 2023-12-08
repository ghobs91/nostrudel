import { useEffect } from "react";

const appName = "Agora";

export function useAppTitle(title?: string) {
  useEffect(() => {
    document.title = [title, appName].filter(Boolean).join(" | ");

    return () => {
      document.title = appName;
    };
  }, [title]);
}
