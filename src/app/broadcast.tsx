import { router } from "expo-router";
import { ChevronRight, Plus, SendHorizontal } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useBroadcastStore } from "../store/useBroadcastStore";

export default function BroadcastList() {
  const drafts = useBroadcastStore((s) => s.drafts);
  const loadList = useBroadcastStore((s) => s.loadList);
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadList();
    setRefreshing(false);
  }, [loadList]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100">Broadcasts</Text>
        <Pressable
          onPress={() => router.push("/broadcast/new")}
          className="rounded-xl bg-emerald-500 p-3 active:bg-emerald-600"
        >
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={drafts}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyExtractor={(d) => String(d.id)}
        ListEmptyComponent={
          <View className="items-center py-20">
            <SendHorizontal size={48} color="#9ca3af" />
            <Text className="mt-4 text-center text-base text-gray-400 dark:text-gray-500">
              No broadcasts yet{"\n"}Tap + to create one
            </Text>
          </View>
        }
        renderItem={({ item: d }) => (
          <Pressable
            onPress={() => router.push(`/broadcast/${d.id}`)}
            className="mb-3 rounded-xl bg-gray-50 p-4 active:opacity-80 dark:bg-gray-800"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-semibold text-gray-900 dark:text-gray-100"
                  numberOfLines={1}
                >
                  {d.message || "No message"}
                </Text>
                <Text className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                  {d.sent}/{d.total} sent · {new Date(d.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                {d.sent === d.total && d.total > 0 && (
                  <View className="rounded-full bg-emerald-100 px-2 py-1 dark:bg-emerald-900/40">
                    <Text className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      Done
                    </Text>
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
