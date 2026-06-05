import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { ArrowLeft, Bell, Check, Clock, MessageCircle, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { completeReminder, deleteReminderById, getAllReminders } from "../db";
import { formatPhoneNumber } from "../store/useAppStore";

interface Reminder {
  id: number;
  phoneNumber: string;
  countryCode: string;
  message: string;
  scheduledAt: number;
  notificationId: string | null;
  completed: number;
  createdAt: number;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const insets = useSafeAreaInsets();

  const load = () => setReminders(getAllReminders());

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert("Delete reminder?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteReminderById(id);
          load();
        },
      },
    ]);
  };

  const handleComplete = (id: number) => {
    completeReminder(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    load();
  };

  const handleOpenWhatsApp = (r: Reminder) => {
    const digits = `${r.countryCode}${r.phoneNumber}`.replace(/\D/g, "");
    const msgParam = r.message ? `&text=${encodeURIComponent(r.message)}` : "";
    Linking.openURL(`whatsapp://send?phone=+${digits}${msgParam}`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const now = Date.now();
  const upcoming = reminders.filter((r) => !r.completed && r.scheduledAt > now);
  const overdue = reminders.filter((r) => !r.completed && r.scheduledAt <= now);
  const done = reminders.filter((r) => r.completed);

  const renderItem = (r: Reminder, isOverdue: boolean) => (
    <View key={r.id} className="rounded-xl p-4 mb-2 bg-gray-50 dark:bg-gray-800">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {r.countryCode} {formatPhoneNumber(r.phoneNumber)}
          </Text>
          {r.message ? (
            <Text className="text-sm mt-1 text-gray-500 dark:text-gray-400" numberOfLines={2}>
              {r.message}
            </Text>
          ) : null}
          <View className="flex-row items-center mt-2">
            <Clock size={12} color={isOverdue ? "#ef4444" : "#9ca3af"} />
            <Text className={`text-xs ml-1 ${isOverdue ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
              {isOverdue ? "Overdue: " : ""}
              {new Date(r.scheduledAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 ml-3">
          <Pressable onPress={() => handleOpenWhatsApp(r)} className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-full active:bg-emerald-200" hitSlop={6}>
            <MessageCircle size={16} color="#059669" />
          </Pressable>
          <Pressable onPress={() => handleComplete(r.id)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full active:bg-gray-200" hitSlop={6}>
            <Check size={16} color="#9ca3af" />
          </Pressable>
          <Pressable onPress={() => handleDelete(r.id)} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full active:bg-gray-200" hitSlop={6}>
            <Trash2 size={16} color="#ef4444" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color="#6b7280" />
        </Pressable>
        <Text className="text-lg font-bold flex-1 text-center text-gray-900 dark:text-gray-100">
          Reminders
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          reminders.length === 0 ? (
            <View className="items-center py-20">
              <Bell size={48} color="#9ca3af" />
              <Text className="text-base mt-4 text-center text-gray-400 dark:text-gray-500">
                No reminders yet{"\n"}Tap the bell icon on a recent contact
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          reminders.length > 0 ? (
            <View>
              {overdue.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-bold text-red-500 mb-2">Overdue</Text>
                  {overdue.map((r) => renderItem(r, true))}
                </View>
              )}
              {upcoming.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-bold mb-2 text-gray-400 dark:text-gray-500">
                    Upcoming
                  </Text>
                  {upcoming.map((r) => renderItem(r, false))}
                </View>
              )}
              {done.length > 0 && (
                <View className="mb-4">
                  <Text className="text-sm font-bold mb-2 text-gray-400 dark:text-gray-500">
                    Completed
                  </Text>
                  {done.map((r) => (
                    <View key={r.id} className="rounded-xl p-4 mb-2 bg-gray-50 dark:bg-gray-800 opacity-60">
                      <View className="flex-row items-center">
                        <Check size={16} color="#059669" />
                        <Text className="text-base font-semibold ml-2 text-gray-400 dark:text-gray-500">
                          {r.countryCode} {formatPhoneNumber(r.phoneNumber)}
                        </Text>
                      </View>
                      {r.message ? (
                        <Text className="text-xs mt-1 ml-6 text-gray-400 dark:text-gray-500" numberOfLines={1}>
                          {r.message}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : undefined
        }
      />
    </View>
  );
}
