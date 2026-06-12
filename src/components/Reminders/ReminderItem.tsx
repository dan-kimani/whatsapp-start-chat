import { Check, Clock, MoreVertical, Star, Sun, Tag } from "lucide-react-native";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { formatPhoneNumber } from "../../store/useAppStore";
import { useIsDark } from "../../hooks/useIsDark";

export interface ReminderData {
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
}

interface Props {
  reminder: ReminderData;
  isOverdue: boolean;
  isCompleted?: boolean;
  onMenuOpen: (reminderId: number, position: { top: number; right: number }) => void;
}

export default function ReminderItem({
  reminder: r,
  isOverdue,
  isCompleted = false,
  onMenuOpen,
}: Props) {
  const isDark = useIsDark();
  const { height: screenHeight } = useWindowDimensions();

  const menuHeight = isCompleted ? 136 : 176;

  return (
    <View
      className={`mb-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-800 ${isCompleted ? "opacity-70" : ""}`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center">
            {isCompleted && <Check size={16} color="#059669" />}
            <Text
              className={`text-base font-semibold ${isCompleted ? "ml-2 text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}
            >
              {r.countryCode} {formatPhoneNumber(r.phoneNumber)}
            </Text>
          </View>
          {r.message ? (
            <Text
              className={`mt-1 text-sm ${isCompleted ? "ml-6 text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}
              numberOfLines={2}
            >
              {r.message}
            </Text>
          ) : null}
          <View className="mt-2 flex-row flex-wrap items-center">
            {isCompleted ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                Completed {new Date(r.scheduledAt).toLocaleString()}
              </Text>
            ) : (
              <>
                <Clock size={12} color={isOverdue ? "#ef4444" : "#9ca3af"} />
                <Text
                  className={`ml-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {isOverdue ? "Overdue: " : ""}
                  {new Date(r.scheduledAt).toLocaleString()}
                </Text>
              </>
            )}
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
                const flipped = y + h + menuHeight > screenHeight;
                onMenuOpen(r.id, { top: flipped ? y - menuHeight - 4 : y + h + 4, right: 20 });
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
}
