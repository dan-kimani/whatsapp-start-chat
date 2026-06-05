import { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { Clock, X } from "lucide-react-native";
import * as db from "../db";

const SHEET_RATIO = 0.55;

const PRESETS: [string, number][] = [
  ["In 1 hour", 60 * 60 * 1000],
  ["Tomorrow 9 AM", 0],
  ["In 3 days", 3 * 24 * 60 * 60 * 1000],
  ["In 1 week", 7 * 24 * 60 * 60 * 1000],
];

interface Props {
  visible: boolean;
  phoneNumber: string;
  countryCode: string;
  contactName?: string;
  onClose: () => void;
}

export default function ReminderSheet({ visible, phoneNumber, countryCode, contactName, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const sheetHeight = screenHeight * SHEET_RATIO;
  const translateY = useState(new Animated.Value(sheetHeight))[0];
  const backdrop = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      translateY.setValue(sheetHeight);
      backdrop.setValue(0);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, damping: 22, stiffness: 200, mass: 0.8, useNativeDriver: true }),
          Animated.timing(backdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: sheetHeight, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setMessage("");
      setSelectedPreset(null);
      onClose();
    });
  };

  const schedule = async (msFromNow: number) => {
    const scheduledAt = Date.now() + msFromNow;

    const reminderId = await db.createReminder(
      phoneNumber,
      countryCode,
      message.trim(),
      scheduledAt,
    );

    const trigger = new Date(scheduledAt);
    // Set 9 AM if "Tomorrow 9 AM" preset
    if (msFromNow === 0) {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(9, 0, 0, 0);
      trigger.setTime(t.getTime());
      const ms = t.getTime() - Date.now();
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: contactName || "Follow-up reminder",
          body: message.trim() || "Time to follow up",
          data: { phoneNumber, countryCode, reminderId, message: message.trim() },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(60, Math.floor(ms / 1000)) },
      });
      await db.updateReminderNotification(reminderId, notifId);
    } else {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: contactName || "Follow-up reminder",
          body: message.trim() || "Time to follow up",
          data: { phoneNumber, countryCode, reminderId, message: message.trim() },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(60, Math.floor(msFromNow / 1000)) },
      });
      await db.updateReminderNotification(reminderId, notifId);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    close();
  };

  const bg = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const muted = isDark ? "#9ca3af" : "#6b7280";

  if (!visible) return null;

  return (
    <Modal visible animationType="none" transparent statusBarTranslucent={false} onRequestClose={close}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Animated.View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }, { opacity: backdrop }]}>
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: sheetHeight + insets.bottom,
          backgroundColor: bg,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          paddingBottom: insets.bottom,
        }, { transform: [{ translateY }] }]}
      >
        <View className="items-center pt-3 pb-1">
          <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: isDark ? "#4b5563" : "#d1d5db" }} />
        </View>

        <View className="flex-1 px-5">
          <View className="flex-row items-center mb-4">
            <Clock size={20} color="#059669" />
            <Text className="text-lg font-bold ml-2" style={{ color: textColor }}>Set Reminder</Text>
          </View>

          {contactName && (
            <Text className="text-sm mb-4" style={{ color: muted }}>
              Follow up with {contactName}
            </Text>
          )}

          <View className="flex-row flex-wrap gap-2 mb-4">
            {PRESETS.map(([label, ms], i) => (
              <Pressable
                key={i}
                onPress={() => schedule(ms)}
                className={`px-4 py-2.5 rounded-xl ${selectedPreset === i ? "bg-emerald-500" : "bg-gray-100 dark:bg-gray-700"} active:opacity-80`}
              >
                <Text className={`text-sm font-medium ${selectedPreset === i ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Optional follow-up message..."
            placeholderTextColor={muted}
            multiline
            className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-base"
            style={{ color: textColor, minHeight: 60, textAlignVertical: "top" }}
            maxLength={300}
          />

          <Text className="text-xs mt-2" style={{ color: muted }}>
            You'll get a notification — tap it to open WhatsApp
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}
