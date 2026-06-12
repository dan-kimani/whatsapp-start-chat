import * as Clipboard from "expo-clipboard";
import { Copy, X } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import MessageEditor from "../Message/MessageEditor";
import { haptics, ImpactFeedbackStyle, NotificationFeedbackType } from "../../lib/haptics";

interface Props {
  template: { id: number; text: string };
  onDelete: (id: number) => void;
  onUpdate: (id: number, newText: string) => void;
}

export default function TemplateItem({ template: t, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const handleStartEdit = () => {
    setEditText(t.text);
    setEditing(true);
  };

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed) onUpdate(t.id, trimmed);
    setEditing(false);
  };

  const handleCopy = () => {
    Clipboard.setStringAsync(t.text);
    haptics.impactAsync(ImpactFeedbackStyle.Light);
  };

  const handleDelete = () => {
    Alert.alert("Delete template?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(t.id) },
    ]);
  };

  if (editing) {
    return (
      <View className="mb-2 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
        <MessageEditor value={editText} onChangeText={setEditText} placeholder="Edit template..." />
        <View className="mt-2 flex-row gap-2">
          <Pressable
            onPress={() => setEditing(false)}
            className="flex-1 items-center rounded-xl bg-gray-200 py-2 dark:bg-gray-600"
          >
            <Text className="text-sm text-gray-600 dark:text-gray-300">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            className="flex-1 items-center rounded-xl bg-emerald-500 py-2"
          >
            <Text className="text-sm font-semibold text-white">Save</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-2 flex-row items-center rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
      <Pressable onPress={handleStartEdit} className="flex-1">
        <Text className="text-base text-gray-900 dark:text-gray-100">{t.text}</Text>
      </Pressable>
      <Pressable onPress={handleCopy} className="p-2" hitSlop={6}>
        <Copy size={16} color="#9ca3af" />
      </Pressable>
      <Pressable onPress={handleDelete} className="p-2" hitSlop={6}>
        <X size={16} color="#9ca3af" />
      </Pressable>
    </View>
  );
}
