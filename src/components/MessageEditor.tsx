import { useRef } from "react";
import { TextInput, View, useColorScheme } from "react-native";
import FormatBar, { applyFormat } from "./FormatBar";
import MessagePreview from "./MessagePreview";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function MessageEditor({ value, onChangeText, placeholder = "Message..." }: Props) {
  const selection = useRef({ start: 0, end: 0 });
  const isDark = useColorScheme() === "dark";

  return (
    <View>
      <FormatBar
        onFormat={(wrapper, line) => {
          const next = applyFormat(value, selection.current, wrapper, line);
          onChangeText(next);
        }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(e) => { selection.current = e.nativeEvent.selection; }}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#94a3b8" : "#9ca3af"}
        multiline
        className="rounded-xl px-4 py-3 text-base"
        style={{
          backgroundColor: isDark ? "#1e293b" : "#f9fafb",
          color: isDark ? "#f1f5f9" : "#111827",
          minHeight: 60,
          textAlignVertical: "top",
        }}
        maxLength={500}
      />
      <MessagePreview text={value} />
    </View>
  );
}
