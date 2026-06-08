import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ArrowLeft, Plus, X, Copy } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MessageEditor from "../components/MessageEditor";
import { useAppStore } from "../store/useAppStore";

export default function TemplatesPage() {
  const templates = useAppStore((s) => s.templates);
  const loadTemplates = useAppStore((s) => s.loadTemplates);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);

  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleAdd = async () => {
    const t = newText.trim();
    if (!t) return;
    await addTemplate(t);
    setNewText("");
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete template?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTemplate(id) },
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color="#6b7280" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          Quick Responses
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Add new */}
      <View className="mb-4 px-5">
        <MessageEditor value={newText} onChangeText={setNewText} placeholder="Add a template..." />
        <Pressable
          onPress={handleAdd}
          disabled={!newText.trim()}
          className="mt-2 items-center justify-center rounded-xl bg-emerald-500 py-4 active:bg-emerald-600"
        >
          <View className="flex-row items-center">
            <Plus size={18} color="#fff" />
            <Text className="ml-2 text-base font-semibold text-white">Add Template</Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        data={templates}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item: t }) => (
          <View className="mb-2 flex-row items-center rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
            {editId === t.id ? (
              <View className="flex-1">
                <MessageEditor
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Edit template..."
                />
                <View className="mt-2 flex-row gap-2">
                  <Pressable
                    onPress={() => setEditId(null)}
                    className="flex-1 items-center rounded-xl bg-gray-200 py-2 dark:bg-gray-600"
                  >
                    <Text className="text-sm text-gray-600 dark:text-gray-300">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (editText.trim()) {
                        deleteTemplate(t.id);
                        addTemplate(editText.trim());
                      }
                      setEditId(null);
                    }}
                    className="flex-1 items-center rounded-xl bg-emerald-500 py-2"
                  >
                    <Text className="text-sm font-semibold text-white">Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setEditId(t.id);
                  setEditText(t.text);
                }}
                className="flex-1"
              >
                <Text className="text-base text-gray-900 dark:text-gray-100">{t.text}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                Clipboard.setStringAsync(t.text);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="p-2"
              hitSlop={6}
            >
              <Copy size={16} color="#9ca3af" />
            </Pressable>
            <Pressable onPress={() => handleDelete(t.id)} className="p-2" hitSlop={6}>
              <X size={16} color="#9ca3af" />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
