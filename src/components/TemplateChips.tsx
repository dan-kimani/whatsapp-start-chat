import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, useColorScheme } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Plus, X, Copy } from "lucide-react-native";
import { useAppStore } from "../store/useAppStore";

interface Props {
  onSelect: (text: string) => void;
}

export default function TemplateChips({ onSelect }: Props) {
  const templates = useAppStore((s) => s.templates);
  const loadTemplates = useAppStore((s) => s.loadTemplates);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const isDark = useColorScheme() === "dark";

  useEffect(() => { loadTemplates(); }, []);

  const handleAdd = async () => {
    const t = newText.trim();
    if (!t) return;
    await addTemplate(t);
    setNewText("");
    setAdding(false);
  };

  return (
    <View className="mb-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 4 }}>
        {templates.map((t) => (
          <View key={t.id} className="flex-row items-center">
            <Pressable
              onPress={() => onSelect(t.text)}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full active:bg-gray-200 dark:active:bg-gray-600"
            >
              <Text
                className="text-xs text-gray-700 dark:text-gray-300"
                numberOfLines={1}
                style={{ maxWidth: 140 }}
              >
                {t.text}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Clipboard.setStringAsync(t.text);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="ml-0.5 p-0.5"
              hitSlop={6}
            >
              <Copy size={10} color={isDark ? "#6b7280" : "#9ca3af"} />
            </Pressable>
            <Pressable
              onPress={() => deleteTemplate(t.id)}
              className="ml-0.5 p-0.5"
              hitSlop={6}
            >
              <X size={10} color={isDark ? "#6b7280" : "#9ca3af"} />
            </Pressable>
          </View>
        ))}
        {adding ? (
          <TextInput
            value={newText}
            onChangeText={setNewText}
            placeholder="New template..."
            placeholderTextColor="#9ca3af"
            className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs text-gray-700 dark:text-gray-300"
            style={{ minWidth: 120 }}
            onSubmitEditing={handleAdd}
            onBlur={() => { if (!newText.trim()) setAdding(false); }}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <Pressable
            onPress={() => setAdding(true)}
            className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full active:bg-gray-200 dark:active:bg-gray-600"
          >
            <Plus size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
