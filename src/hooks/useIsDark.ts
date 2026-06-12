import { useColorScheme } from "react-native";

import { useAppStore } from "../store/useAppStore";

/** Resolves the effective dark mode, respecting the user's theme preference. */
export function useIsDark(): boolean {
  const systemScheme = useColorScheme();
  const theme = useAppStore((s) => s.theme);
  if (theme === "light") return false;
  if (theme === "dark") return true;
  return systemScheme === "dark";
}
