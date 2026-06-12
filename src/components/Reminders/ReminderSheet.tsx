import {
  type BottomSheetMethods,
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Search, Star, Sun, Tag, X } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppStore } from "../../store/useAppStore";
import { type ReminderEditData, PRESETS, useReminderStore } from "../../store/useReminderStore";
import { useIsDark } from "../../hooks/useIsDark";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
}

function fmtTime(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const dh = h % 12 || 12;
  return `${dh}:${m.toString().padStart(2, "0")} ${period}`;
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

// ── Chip style helpers ───────────────────────────────────────────────────────

function chipClasses(active: boolean) {
  return active
    ? "bg-emerald-600 border-emerald-600"
    : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
}

function pickerBtnClasses(enabled: boolean) {
  return enabled ? "bg-gray-100 dark:bg-gray-800" : "bg-gray-200 dark:bg-gray-700 opacity-60";
}

function pickerBtnTextClasses(enabled: boolean) {
  return enabled ? "text-gray-900 dark:text-gray-50" : "text-gray-500 dark:text-gray-400";
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  phoneNumber: string;
  countryCode: string;
  contactName?: string;
  editReminder?: ReminderEditData | null;
  onClose: () => void;
  onSaved?: () => void;
}

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
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const store = useReminderStore();
  const customTags = useAppStore((s) => s.customTags);

  const isEditing = !!editReminder;

  const filteredTags = store.tagSearch.trim()
    ? store.existingTags.filter((t) =>
        t.toLowerCase().includes(store.tagSearch.toLowerCase().trim()),
      )
    : store.existingTags;

  useEffect(() => {
    if (visible) {
      store.loadTags(customTags);
      if (editReminder) store.init(editReminder);
      else store.reset();
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editReminder]);

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

            {/* Time presets */}
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

            {/* Custom date/time pickers */}
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
                  className={`min-h-12 flex-1 justify-center rounded-xl border border-gray-200 px-3.5 dark:border-gray-700 ${pickerBtnClasses(!!store.customDate)}`}
                >
                  <Text
                    numberOfLines={1}
                    className={`text-sm font-semibold ${pickerBtnTextClasses(!!store.customDate)}`}
                  >
                    {store.customTime
                      ? fmtTime(store.customTime.h, store.customTime.m)
                      : "Pick time"}
                  </Text>
                </TapView>
              </View>
            )}

            {/* Priority / My Day toggles */}
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

            {/* Message */}
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

            {/* Tags */}
            {store.existingTags.length > 0 && (
              <>
                <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-100 px-3 dark:border-gray-700 dark:bg-gray-800">
                  <Search size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
                  <TextInput
                    value={store.tagSearch}
                    onChangeText={store.setTagSearch}
                    placeholder="Filter tags..."
                    placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                    className="flex-1 px-2 py-2 text-[14px] text-gray-900 dark:text-gray-50"
                  />
                  {store.tagSearch.length > 0 && (
                    <Pressable onPress={() => store.setTagSearch("")} hitSlop={8}>
                      <X size={14} color={isDark ? "#9ca3af" : "#6b7280"} strokeWidth={2.5} />
                    </Pressable>
                  )}
                </View>
                <ScrollView
                  style={{ maxHeight: 110 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View className="flex-row flex-wrap gap-2">
                    {filteredTags.map((tag) => {
                      const selected = store.tags.includes(tag);
                      return (
                        <Pressable
                          key={tag}
                          onPressIn={() => store.toggleTag(tag)}
                          className={`flex-row items-center gap-1 rounded-xl border px-3 py-2 ${selected ? "border-indigo-500 bg-indigo-500" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
                        >
                          <Tag size={12} color={selected ? "#fff" : "#9ca3af"} />
                          <Text
                            className={`text-[13px] font-semibold ${selected ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
                          >
                            {tag}
                          </Text>
                        </Pressable>
                      );
                    })}
                    {filteredTags.length === 0 && (
                      <Text className="py-2 text-xs text-gray-400 dark:text-gray-500">
                        No matching tags
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
            {store.existingTags.length === 0 && (
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                No tags yet — create them on the Reminders page
              </Text>
            )}

            {/* Save button */}
            <TapView
              onPress={() =>
                target &&
                store.save({
                  target,
                  phoneNumber,
                  countryCode,
                  contactName,
                  editReminder,
                  onSaved,
                  onClose,
                })
              }
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
