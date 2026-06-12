import { useFocusEffect } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MessageEditor from "../components/Message/MessageEditor";
import TemplateItem from "../components/Templates/TemplateItem";
import PageHeader from "../components/ui/PageHeader";
import { useAppStore } from "../store/useAppStore";

export default function TemplatesPage() {
  const templates = useAppStore((s) => s.templates);
  const loadTemplates = useAppStore((s) => s.loadTemplates);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);

  const [newText, setNewText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTemplates();
    setRefreshing(false);
  }, [loadTemplates]);

  const handleAdd = () => {
    const t = newText.trim();
    if (!t) return;
    addTemplate(t);
    setNewText("");
  };

  const handleUpdate = (id: number, text: string) => {
    deleteTemplate(id);
    addTemplate(text);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <PageHeader title="Quick Responses" />

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyExtractor={(t) => String(t.id)}
        renderItem={({ item }) => (
          <TemplateItem template={item} onDelete={deleteTemplate} onUpdate={handleUpdate} />
        )}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-center text-base text-gray-400 dark:text-gray-500">
              No templates yet{"\n"}Add your first quick response above
            </Text>
          </View>
        }
      />
    </View>
  );
}
