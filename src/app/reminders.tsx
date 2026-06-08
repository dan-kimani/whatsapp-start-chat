import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock,
  MessageCircle,
  MoreVertical,
  Pencil,
  Star,
  Sun,
  Tag,
  Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ReminderSheet, { type ReminderEditData } from "../components/ReminderSheet";
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
  priority: number;
  myDay: number;
  tags: string | null;
  createdAt: number;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [editReminder, setEditReminder] = useState<ReminderEditData | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [menuReminderId, setMenuReminderId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });
  const isDark = useColorScheme() === "dark";
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const load = () => setReminders(getAllReminders());

  useEffect(() => {
    load();
  }, []);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const now = Date.now();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayReminders = reminders.filter((r) => {
    if (r.myDay === 1) return true;
    const t = r.scheduledAt;
    return t >= todayStart.getTime() && t <= todayEnd.getTime();
  });
  const priorityReminders = reminders.filter((r) => r.priority === 1);

  // Extract unique tags from all reminders
  const allTags: string[] = (() => {
    const tagSet = new Set<string>();
    for (const r of reminders) {
      if (r.tags) {
        r.tags.split(",").forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    }
    return [...tagSet].sort();
  })();

  const filtered =
    filter === "all"
      ? reminders
      : filter === "today"
        ? todayReminders
        : filter === "priority"
          ? priorityReminders
          : reminders.filter((r) => {
              if (!r.tags) return false;
              return r.tags.split(",").some((t) => t.trim() === filter);
            });

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

  const upcoming = filtered.filter((r) => !r.completed && r.scheduledAt > now);
  const overdue = filtered.filter((r) => !r.completed && r.scheduledAt <= now);
  const done = filtered.filter((r) => r.completed);

  const renderItem = (r: Reminder, isOverdue: boolean) => (
    <View key={r.id} className="mb-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {r.countryCode} {formatPhoneNumber(r.phoneNumber)}
          </Text>
          {r.message ? (
            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400" numberOfLines={2}>
              {r.message}
            </Text>
          ) : null}
          <View className="mt-2 flex-row items-center">
            <Clock size={12} color={isOverdue ? "#ef4444" : "#9ca3af"} />
            <Text
              className={`ml-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}
            >
              {isOverdue ? "Overdue: " : ""}
              {new Date(r.scheduledAt).toLocaleString()}
            </Text>
            {r.priority === 1 && (
              <View className="ml-2 flex-row items-center rounded-full bg-amber-100 px-1.5 py-0.5 dark:bg-amber-900/30">
                <Star size={10} color="#d97706" fill="#d97706" />
                <Text className="ml-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Priority
                </Text>
              </View>
            )}
            {r.myDay === 1 && (
              <View className="ml-2 flex-row items-center rounded-full bg-sky-100 px-1.5 py-0.5 dark:bg-sky-900/30">
                <Sun size={10} color="#0284c7" />
                <Text className="ml-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-400">
                  My Day
                </Text>
              </View>
            )}
            {r.tags &&
              r.tags.split(",").map((tag) => {
                const trimmed = tag.trim();
                if (!trimmed) return null;
                return (
                  <View
                    key={trimmed}
                    className="ml-2 flex-row items-center rounded-full bg-indigo-100 px-1.5 py-0.5 dark:bg-indigo-900/30"
                  >
                    <Tag size={9} color="#4f46e5" />
                    <Text className="ml-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                      {trimmed}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>

        <View className="ml-3">
          <Pressable
            onPress={(e) => {
              (e.target as any).measureInWindow((_x: number, y: number, _w: number, h: number) => {
                const menuH = 176;
                const flipped = y + h + menuH > screenHeight;
                setMenuPos({ top: flipped ? y - menuH - 4 : y + h + 4, right: 20 });
                setMenuReminderId(r.id);
              });
            }}
            className="rounded-full bg-gray-100 p-2 active:bg-gray-200 dark:bg-gray-700 dark:active:bg-gray-600"
            hitSlop={6}
          >
            <MoreVertical size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
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
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          Reminders
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <View className="flex-row flex-wrap gap-2 px-4 pb-2">
        <Pressable
          onPress={() => setFilter(filter === "today" ? "all" : "today")}
          className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${filter === "today" ? "border-emerald-600 bg-emerald-600" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
        >
          <Text
            className={`text-[13px] font-semibold ${filter === "today" ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
          >
            My Day
          </Text>
          {todayReminders.length > 0 && (
            <View
              className={`rounded-full px-1.5 py-0.5 ${filter === "today" ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <Text
                className={`text-[11px] font-bold ${filter === "today" ? "text-white" : "text-gray-500 dark:text-gray-300"}`}
              >
                {todayReminders.length}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={() => setFilter(filter === "priority" ? "all" : "priority")}
          className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${filter === "priority" ? "border-amber-500 bg-amber-500" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
        >
          <Star
            size={13}
            color={filter === "priority" ? "#fff" : "#9ca3af"}
            fill={filter === "priority" ? "#fff" : "none"}
          />
          <Text
            className={`text-[13px] font-semibold ${filter === "priority" ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
          >
            Priority
          </Text>
          {priorityReminders.length > 0 && (
            <View
              className={`rounded-full px-1.5 py-0.5 ${filter === "priority" ? "bg-amber-400" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <Text
                className={`text-[11px] font-bold ${filter === "priority" ? "text-white" : "text-gray-500 dark:text-gray-300"}`}
              >
                {priorityReminders.length}
              </Text>
            </View>
          )}
        </Pressable>
        {allTags.map((tag) => {
          const isActive = filter === tag;
          const tagCount = reminders.filter(
            (r) => r.tags && r.tags.split(",").some((t) => t.trim() === tag),
          ).length;
          return (
            <Pressable
              key={tag}
              onPress={() => setFilter(isActive ? "all" : tag)}
              className={`flex-row items-center gap-1 rounded-xl border px-3 py-2 ${isActive ? "border-indigo-500 bg-indigo-500" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
            >
              <Tag size={12} color={isActive ? "#fff" : "#9ca3af"} />
              <Text
                className={`text-[13px] font-semibold ${isActive ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
              >
                {tag}
              </Text>
              <View
                className={`rounded-full px-1.5 py-0.5 ${isActive ? "bg-indigo-400" : "bg-gray-300 dark:bg-gray-600"}`}
              >
                <Text
                  className={`text-[11px] font-bold ${isActive ? "text-white" : "text-gray-500 dark:text-gray-300"}`}
                >
                  {tagCount}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          filtered.length === 0 ? (
            <View className="items-center py-20">
              <Bell size={48} color="#9ca3af" />
              <Text className="mt-4 text-center text-base text-gray-400 dark:text-gray-500">
                {reminders.length === 0
                  ? "No reminders yet\nTap the bell icon on a recent contact"
                  : "No reminders match this filter"}
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          filtered.length > 0 ? (
            <View>
              {overdue.length > 0 && (
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-bold text-red-500">Overdue</Text>
                  {overdue.map((r) => renderItem(r, true))}
                </View>
              )}
              {upcoming.length > 0 && (
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-bold text-gray-400 dark:text-gray-500">
                    Upcoming
                  </Text>
                  {upcoming.map((r) => renderItem(r, false))}
                </View>
              )}
              {done.length > 0 && (
                <View className="mb-4">
                  <Text className="mb-2 text-sm font-bold text-gray-400 dark:text-gray-500">
                    Completed
                  </Text>
                  {done.map((r) => (
                    <View
                      key={r.id}
                      className="mb-2 rounded-xl bg-gray-50 p-4 opacity-60 dark:bg-gray-800"
                    >
                      <View className="flex-row items-center">
                        <Check size={16} color="#059669" />
                        <Text className="ml-2 text-base font-semibold text-gray-400 dark:text-gray-500">
                          {r.countryCode} {formatPhoneNumber(r.phoneNumber)}
                        </Text>
                      </View>
                      {r.message ? (
                        <Text
                          className="mt-1 ml-6 text-xs text-gray-400 dark:text-gray-500"
                          numberOfLines={1}
                        >
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

      {menuReminderId !== null &&
        (() => {
          const menuReminder = reminders.find((r) => r.id === menuReminderId);
          if (!menuReminder) return null;
          return (
            <Modal
              visible
              transparent
              animationType="fade"
              onRequestClose={() => setMenuReminderId(null)}
            >
              <Pressable style={{ flex: 1 }} onPress={() => setMenuReminderId(null)} />
              <View
                className="absolute rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                style={{ top: menuPos.top, right: menuPos.right, minWidth: 170 }}
              >
                <Pressable
                  onPress={() => {
                    setMenuReminderId(null);
                    handleOpenWhatsApp(menuReminder);
                  }}
                  className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
                >
                  <MessageCircle size={16} color="#059669" />
                  <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">WhatsApp</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMenuReminderId(null);
                    setEditReminder(menuReminder as ReminderEditData);
                    setEditVisible(true);
                  }}
                  className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
                >
                  <Pencil size={16} color="#6b7280" />
                  <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMenuReminderId(null);
                    handleComplete(menuReminder.id);
                  }}
                  className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
                >
                  <Check size={16} color="#059669" />
                  <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Complete</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setMenuReminderId(null);
                    handleDelete(menuReminder.id);
                  }}
                  className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text className="ml-3 text-sm text-red-500">Delete</Text>
                </Pressable>
              </View>
            </Modal>
          );
        })()}

      <ReminderSheet
        visible={editVisible}
        phoneNumber={editReminder?.phoneNumber || ""}
        countryCode={editReminder?.countryCode || ""}
        editReminder={editReminder}
        onClose={() => {
          setEditVisible(false);
          setEditReminder(null);
        }}
        onSaved={() => {
          load();
          setEditVisible(false);
          setEditReminder(null);
        }}
      />
    </View>
  );
}
