import { Pressable, Text, View } from "react-native";
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote } from "lucide-react-native";

interface FormatBarProps {
  onFormat: (wrapper: string, linePrefix?: boolean) => void;
}

const INLINE = [
  { icon: Bold, wrapper: "*", label: "Bold" },
  { icon: Italic, wrapper: "_", label: "Italic" },
  { icon: Strikethrough, wrapper: "~", label: "Strikethrough" },
  { icon: Code, wrapper: "`", label: "Monospace" },
];

const LINE = [
  { icon: List, prefix: "* ", label: "Bullet list" },
  { icon: ListOrdered, prefix: "1. ", label: "Numbered list" },
  { icon: Quote, prefix: "> ", label: "Quote" },
];

export default function FormatBar({ onFormat }: FormatBarProps) {
  return (
    <View className="flex-row gap-1 px-4 py-2">
      {INLINE.map((f) => (
        <Pressable
          key={f.label}
          onPress={() => onFormat(f.wrapper)}
          className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg active:bg-gray-200 dark:active:bg-gray-600"
        >
          <f.icon size={16} color="#6b7280" />
        </Pressable>
      ))}
      <View className="w-px bg-gray-200 dark:bg-gray-600 mx-1" />
      {LINE.map((f) => (
        <Pressable
          key={f.label}
          onPress={() => onFormat(f.prefix, true)}
          className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg active:bg-gray-200 dark:active:bg-gray-600"
        >
          <f.icon size={16} color="#6b7280" />
        </Pressable>
      ))}
    </View>
  );
}

/**
 * Applies WhatsApp formatting to text.
 * - Inline wrappers (*, _, ~, `): wraps selected text or inserts at cursor.
 * - Line prefixes (* , 1. , > ): prepends to the start of the line at cursor.
 *
 * Call this from onChangeText or on a format button handler.
 */
export function applyFormat(
  text: string,
  selection: { start: number; end: number },
  wrapper: string,
  linePrefix?: boolean,
): string {
  if (linePrefix) {
    // Find start of the current line
    let lineStart = selection.start;
    while (lineStart > 0 && text[lineStart - 1] !== "\n") lineStart--;
    const before = text.slice(0, lineStart);
    const after = text.slice(lineStart);
    return before + wrapper + after;
  }

  // Inline wrapping
  const { start, end } = selection;
  if (start === end) {
    // No selection — insert wrapper twice, cursor between
    return text.slice(0, start) + wrapper + wrapper + text.slice(end);
  }
  // Wrap selected text
  return text.slice(0, start) + wrapper + text.slice(start, end) + wrapper + text.slice(end);
}
