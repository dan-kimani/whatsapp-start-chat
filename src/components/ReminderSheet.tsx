import {
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetMethods,
} from "@expo/ui/community/bottom-sheet";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Pencil, Star, Sun } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, Text, TextInput, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { create } from "zustand";

import * as db from "../db";

type Preset =
  | { label: string; kind: "relative"; ms: number }
  | { label: string; kind: "tomorrow"; hour: number };

const PRESETS: Preset[] = [
  { label: "In 1 hour", kind: "relative", ms: 60 * 60 * 1000 },
  { label: "In 3 hours", kind: "relative", ms: 3 * 60 * 60 * 1000 },
  { label: "Tomorrow 8 AM", kind: "tomorrow", hour: 8 },
  { label: "Tomorrow 11 AM", kind: "tomorrow", hour: 11 },
];

export interface ReminderEditData {
  id: number;
  phoneNumber: string;
  countryCode: string;
  message: string;
  scheduledAt: number;
  notificationId: string | null;
  priority: number;
  myDay: number;
  tags: string | null;
}

interface Props {
  visible: boolean;
  phoneNumber: string;
  countryCode: string;
  contactName?: string;
  editReminder?: ReminderEditData | null;
  onClose: () => void;
  onSaved?: () => void;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
}

function fmtTime(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const dh = h % 12 || 12;
  return `${dh}:${m.toString().padStart(2, "0")} ${period}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function chipClasses(active: boolean) {
  return active
    ? "bg-emerald-600 border-emerald-600"
    : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
}

function pickerButtonClasses(enabled: boolean) {
  return enabled ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-700 opacity-60";
}

function pickerButtonTextClasses(enabled: boolean) {
  return enabled ? "text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400";
}

// ── TapView ──────────────────────────────────────────────────────────────────

function TapView({
  onPress,
  disabled,
  className = "",
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPressIn={disabled ? undefined : onPress}
      disabled={disabled}
      className={className}
      style={({ pressed }) => pressed && !disabled && { opacity: 0.7 }}
    >
      {children}
    </Pressable>
  );
}

// ── Store ────────────────────────────────────────────────────────────────────

type ReminderStore = {
  message: string;
  preset: number | null;
  customDate: Date | null;
  customTime: { h: number; m: number } | null;
  priority: number;
  myDay: number;
  tags: string;
  datePickerOpen: boolean;
  timePickerOpen: boolean;
  selectPreset: (index: number) => void;
  setMessage: (text: string) => void;
  setCustomDate: (date: Date) => void;
  setCustomTime: (h: number, m: number) => void;
  togglePriority: () => void;
  toggleMyDay: () => void;
  setTags: (text: string) => void;
  init: (r: ReminderEditData) => void;
  openDatePicker: () => void;
  openTimePicker: () => void;
  closeDatePicker: () => void;
  closeTimePicker: () => void;
  reset: () => void;
};

const useReminderStore = create<ReminderStore>((set) => ({
  message: "",
  preset: null,
  customDate: null,
  customTime: null,
  priority: 0,
  myDay: 0,
  tags: "",
  datePickerOpen: false,
  timePickerOpen: false,
  selectPreset: (index) => set({ preset: index, customDate: null, customTime: null }),
  setMessage: (text) => set({ message: text }),
  setCustomDate: (date) => set({ customDate: date, datePickerOpen: false }),
  setCustomTime: (h, m) => set({ customTime: { h, m }, timePickerOpen: false }),
  togglePriority: () => set((s) => ({ priority: s.priority ? 0 : 1 })),
  toggleMyDay: () => set((s) => ({ myDay: s.myDay ? 0 : 1 })),
  setTags: (text) => set({ tags: text }),
  init: (r) => {
    const d = new Date(r.scheduledAt);
    set({
      message: r.message,
      preset: PRESETS.length, // Custom
      customDate: d,
      customTime: { h: d.getHours(), m: d.getMinutes() },
      priority: r.priority,
      myDay: r.myDay,
      tags: r.tags || "",
    });
  },
  openDatePicker: () => set({ datePickerOpen: true }),
  openTimePicker: () => set({ timePickerOpen: true }),
  closeDatePicker: () => set({ datePickerOpen: false }),
  closeTimePicker: () => set({ timePickerOpen: false }),
  reset: () =>
    set({
      message: "",
      preset: null,
      customDate: null,
      customTime: null,
      priority: 0,
      myDay: 0,
      tags: "",
      datePickerOpen: false,
      timePickerOpen: false,
    }),
}));

// ── Component ────────────────────────────────────────────────────────────────

export default function ReminderSheet({
  visible,
  phoneNumber,
  countryCode,
  contactName,
  editReminder,
  onClose,
  onSaved,
}: Props) {
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const store = useReminderStore();

  const isEditing = !!editReminder;

  useEffect(() => {
    if (visible) {
      if (editReminder) {
        store.init(editReminder);
      } else {
        store.reset();
      }
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const isCustom = store.preset === PRESETS.length;

  const getTargetDate = (): Date | null => {
    if (store.preset === null) return null;
    if (isCustom) {
      if (!store.customDate || !store.customTime) return null;
      const d = new Date(store.customDate);
      d.setHours(store.customTime.h, store.customTime.m, 0, 0);
      return d;
    }
    const preset = PRESETS[store.preset];
    if (preset.kind === "tomorrow") {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(preset.hour, 0, 0, 0);
      return t;
    }
    return new Date(Date.now() + preset.ms);
  };

  const handleClose = () => {
    store.reset();
    onClose();
  };

  const save = async (target: Date) => {
    const msg = store.message.trim();
    if (!msg) return;

    const tagsValue = store.tags.trim() || null;
    const targetMs = target.getTime();

    if (isEditing && editReminder) {
      // Cancel old notification
      if (editReminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(editReminder.notificationId);
      }
      // Update reminder
      db.updateReminder(editReminder.id, {
        message: msg,
        scheduledAt: targetMs,
        priority: store.priority,
        myDay: store.myDay,
        tags: tagsValue,
      });
      // Schedule new notification
      const seconds = Math.max(60, Math.floor((targetMs - Date.now()) / 1000));
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: contactName || "Follow-up reminder",
          body: msg,
          data: { phoneNumber, countryCode, reminderId: editReminder.id, message: msg },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
      });
      db.updateReminderNotification(editReminder.id, notifId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Reminder updated", visibilityTime: 2000 });
    } else {
      const reminderId = db.createReminder(
        phoneNumber,
        countryCode,
        msg,
        targetMs,
        store.priority,
        store.myDay,
        tagsValue,
      );
      const seconds = Math.max(60, Math.floor((targetMs - Date.now()) / 1000));
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: contactName || "Follow-up reminder",
          body: msg,
          data: { phoneNumber, countryCode, reminderId, message: msg },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
      });
      db.updateReminderNotification(reminderId, notifId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Reminder set", visibilityTime: 2000 });
    }
    handleClose();
    onSaved?.();
  };

  const target = getTargetDate();
  const hasMessage = store.message.trim().length > 0;
  const canSave = target !== null && (isEditing || target.getTime() > Date.now()) && hasMessage;
  const saveLabel = !target
    ? "Pick a time"
    : !hasMessage
      ? "Add a message"
      : isEditing
        ? `Update · ${fmtDate(target)} at ${fmtTime(target.getHours(), target.getMinutes())}`
        : target.getTime() <= Date.now()
          ? "Pick a future time"
          : `Save · ${fmtDate(target)} at ${fmtTime(target.getHours(), target.getMinutes())}`;

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        enablePanDownToClose
        onDismiss={handleClose}
        backgroundStyle={{ backgroundColor: isDark ? "#111827" : "#ffffff" }}
      >
        <BottomSheetView
          style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
            gap: 18,
          }}
        >
          <View collapsable={false} className="flex-1 gap-4.5">
            <View className="gap-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {isEditing ? "Edit Reminder" : "Set Reminder"}
              </Text>
              {(contactName || phoneNumber) && (
                <Text className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                  Follow up with {contactName || phoneNumber}
                </Text>
              )}
            </View>

            <View className="flex-row flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <TapView
                  key={p.label}
                  onPress={() => store.selectPreset(i)}
                  className={`min-h-9.5 justify-center rounded-xl border px-3 py-2.25 ${chipClasses(store.preset === i)}`}
                >
                  <Text
                    numberOfLines={1}
                    className={`text-[13px] font-semibold ${store.preset === i ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
                  >
                    {p.label}
                  </Text>
                </TapView>
              ))}
              <TapView
                onPress={() => store.selectPreset(PRESETS.length)}
                className={`min-h-9.5 justify-center rounded-xl border px-3 py-2.25 ${chipClasses(isCustom)}`}
              >
                <Text
                  numberOfLines={1}
                  className={`text-[13px] font-semibold ${isCustom ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
                >
                  Custom
                </Text>
              </TapView>
            </View>

            {isCustom && (
              <View className="flex-row gap-2.5">
                <TapView
                  onPress={() => store.openDatePicker()}
                  className="min-h-12 flex-1 justify-center rounded-xl border border-gray-200 bg-gray-100 px-3.5 dark:border-gray-700 dark:bg-gray-800"
                >
                  <Text
                    numberOfLines={1}
                    className="text-sm font-semibold text-gray-900 dark:text-gray-50"
                  >
                    {store.customDate ? fmtDate(store.customDate) : "Pick date"}
                  </Text>
                </TapView>
                <TapView
                  onPress={() => store.openTimePicker()}
                  disabled={!store.customDate}
                  className={`min-h-12 flex-1 justify-center rounded-xl border border-gray-200 px-3.5 dark:border-gray-700 ${pickerButtonClasses(!!store.customDate)}`}
                >
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-semibold ${pickerButtonTextClasses(!!store.customDate)}`}
                  >
                    {store.customTime
                      ? fmtTime(store.customTime.h, store.customTime.m)
                      : "Pick time"}
                  </Text>
                </TapView>
              </View>
            )}

            <View className="flex-row gap-2">
              <TapView
                onPress={() => store.togglePriority()}
                className={`min-h-9.5 flex-row items-center justify-center gap-1.5 self-start rounded-xl border px-3 py-2.25 ${store.priority ? "border-amber-500 bg-amber-500" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
              >
                <Star
                  size={14}
                  color={store.priority ? "#fff" : "#9ca3af"}
                  fill={store.priority ? "#fff" : "none"}
                />
                <Text
                  numberOfLines={1}
                  className={`text-[13px] font-semibold ${store.priority ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
                >
                  High Priority
                </Text>
              </TapView>
              <TapView
                onPress={() => store.toggleMyDay()}
                className={`min-h-9.5 flex-row items-center justify-center gap-1.5 self-start rounded-xl border px-3 py-2.25 ${store.myDay ? "border-sky-500 bg-sky-500" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
              >
                <Sun size={14} color={store.myDay ? "#fff" : "#9ca3af"} />
                <Text
                  numberOfLines={1}
                  className={`text-[13px] font-semibold ${store.myDay ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
                >
                  My Day
                </Text>
              </TapView>
            </View>

            <TextInput
              value={store.message}
              onChangeText={(text) => store.setMessage(text)}
              placeholder="Message..."
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-24 rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-3 text-[15px] leading-5.25 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
            />

            <TextInput
              value={store.tags}
              onChangeText={(text) => store.setTags(text)}
              placeholder="Tags (comma-separated, optional)"
              placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
              className="rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-[14px] text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
            />

            <TapView
              onPress={() => target && save(target)}
              disabled={!canSave}
              className={`min-h-13 items-center justify-center rounded-[14px] px-4 py-3 ${canSave ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <Text
                numberOfLines={2}
                className={`text-center text-[15px] font-bold ${canSave ? "text-white" : "text-gray-500 dark:text-gray-400"}`}
              >
                {saveLabel}
              </Text>
            </TapView>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {store.datePickerOpen && (
        <DateTimePicker
          presentation="dialog"
          mode="date"
          value={store.customDate ?? new Date()}
          minimumDate={new Date()}
          accentColor="#059669"
          themeVariant={isDark ? "dark" : "light"}
          onValueChange={(_ev, date) => store.setCustomDate(date)}
          onDismiss={() => store.closeDatePicker()}
        />
      )}
      {store.timePickerOpen && (
        <DateTimePicker
          mode="time"
          presentation="dialog"
          value={new Date()}
          accentColor="#059669"
          themeVariant={isDark ? "dark" : "light"}
          onValueChange={(_ev, date) => store.setCustomTime(date.getHours(), date.getMinutes())}
          onDismiss={() => store.closeTimePicker()}
        />
      )}
    </>
  );
}
