import { router } from "expo-router";
import { ChevronRight, Plus, SendHorizontal } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBroadcasts, getBroadcastProgress } from "../db";

interface Draft {
  id: number;
  message: string;
  createdAt: number;
  total: number;
  sent: number;
}

export default function BroadcastList() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const insets = useSafeAreaInsets();

  const load = () => {
    const broadcasts = getBroadcasts();
    const withProgress = broadcasts.map((b) => {
      const progress = getBroadcastProgress(b.id);
      return { ...b, ...progress };
    });
    setDrafts(withProgress);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row justify-between items-center px-5 py-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Broadcasts
        </Text>
        <Pressable onPress={() => router.push("/broadcast/new")} className="bg-emerald-500 p-3 rounded-xl active:bg-emerald-600">
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={drafts}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyExtractor={(d) => String(d.id)}
        ListEmptyComponent={
          <View className="items-center py-20">
            <SendHorizontal size={48} color="#9ca3af" />
            <Text className="text-base mt-4 text-center text-gray-400 dark:text-gray-500">
              No broadcasts yet{"\n"}Tap + to create one
            </Text>
          </View>
        }
        renderItem={({ item: d }) => (
          <Pressable onPress={() => router.push(`/broadcast/${d.id}`)} className="rounded-xl p-4 mb-3 bg-gray-50 dark:bg-gray-800 active:opacity-80">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100" numberOfLines={1}>
                  {d.message || "No message"}
                </Text>
                <Text className="text-sm mt-1 text-gray-400 dark:text-gray-500">
                  {d.sent}/{d.total} sent · {new Date(d.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                {d.sent === d.total && d.total > 0 && (
                  <View className="bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full">
                    <Text className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Done</Text>
                  </View>
                )}
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
