import { useState, useEffect } from "react";
import { AppState } from "react-native";
import * as Clipboard from "expo-clipboard";

export function useSmartClipboard(currentRawValue: string) {
  const [clipboardContent, setClipboardContent] = useState<string | null>(null);

  useEffect(() => {
    const checkClipboard = async () => {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) {
        setClipboardContent(null);
        return;
      }

      const content = await Clipboard.getStringAsync();

      // Simple validation: Allow +, spaces, dashes, parentheses
      // Must contain at least 5 digits to be worth pasting
      const digitCount = (content.match(/\d/g) || []).length;
      const validChars = /^[+\d\s\-\(\).]*$/;

      // Check against current value to avoid showing what user already typed
      const isDifferent = content.replace(/\D/g, "") !== currentRawValue;

      if (digitCount >= 6 && digitCount <= 15 && validChars.test(content) && isDifferent) {
        setClipboardContent(content.trim());
      } else {
        setClipboardContent(null);
      }
    };

    // Check immediately and on every app focus
    checkClipboard();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkClipboard();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentRawValue]);

  return clipboardContent;
}
