import {
  type BottomSheetMethods,
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { Search, Tag, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import * as db from "../../db";
import { useAppStore } from "../../store/useAppStore";
import { useIsDark } from "../../hooks/useIsDark";

interface Props {
  visible: boolean;
  phoneNumber: string;
  countryCode: string;
  contactName?: string;
  initialNote: string;
  initialTags: string[];
  onClose: () => void;
  onSave: (note: string, tags: string[]) => void;
}

export default function NoteSheet({
  visible,
  phoneNumber,
  countryCode,
  contactName,
  initialNote,
  initialTags,
  onClose,
  onSave,
}: Props) {
  const isDark = useIsDark();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const storeCustomTags = useAppStore((s) => s.customTags);

  useEffect(() => {
    if (visible) {
      setNote(initialNote);
      setTags(initialTags);
      setTagSearch("");
      // Merge all tag sources: custom + reminders + contacts + existing on this contact
      let contactTags: string[] = [];
      let reminderTags: string[] = [];
      try {
        contactTags = db.getAllContactTags();
      } catch {
        /* migration pending */
      }
      try {
        reminderTags = db.getAllTags();
      } catch {
        /* migration pending */
      }
      const merged = [
        ...new Set([...storeCustomTags, ...reminderTags, ...contactTags, ...initialTags]),
      ].sort();
      setAllTags(merged);
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const filteredTags = tagSearch.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase().trim()))
    : allTags;

  const hasExisting = initialNote.length > 0 || initialTags.length > 0;

  return (
    <BottomSheetModal
      ref={sheetRef}
      enablePanDownToClose
      onDismiss={onClose}
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
        <View className="gap-1">
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {hasExisting ? "Edit details" : "Add details"}
          </Text>
          <Text className="text-sm leading-5 text-gray-500 dark:text-gray-400">
            {contactName || `${countryCode} ${phoneNumber}`}
          </Text>
        </View>

        {/* ── Note ────────────────────────────────────────────────── */}
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Note about this contact..."
          placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          autoFocus
          className="min-h-24 rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-3 text-[15px] leading-5.25 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
        />

        {/* ── Tags ────────────────────────────────────────────────── */}
        {allTags.length > 0 ? (
          <>
            <View className="flex-row items-center rounded-xl border border-gray-200 bg-gray-100 px-3 dark:border-gray-700 dark:bg-gray-800">
              <Search size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
              <TextInput
                value={tagSearch}
                onChangeText={setTagSearch}
                placeholder="Filter tags..."
                placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                className="flex-1 px-2 py-2 text-[14px] text-gray-900 dark:text-gray-50"
              />
              {tagSearch.length > 0 && (
                <Pressable onPressIn={() => setTagSearch("")} hitSlop={8}>
                  <X size={14} color={isDark ? "#9ca3af" : "#6b7280"} strokeWidth={2.5} />
                </Pressable>
              )}
            </View>
            <ScrollView style={{ maxHeight: 110 }} showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap gap-2">
                {filteredTags.map((tag) => {
                  const selected = tags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPressIn={() => toggleTag(tag)}
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
        ) : (
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            No tags yet — create them on the Reminders page
          </Text>
        )}

        {/* ── Actions ─────────────────────────────────────────────── */}
        <View className="flex-row gap-3">
          <Pressable
            onPressIn={onClose}
            className="flex-1 items-center rounded-xl bg-gray-200 py-3 dark:bg-gray-700"
          >
            <Text className="text-base font-semibold text-gray-600 dark:text-gray-300">Cancel</Text>
          </Pressable>
          <Pressable
            onPressIn={() => onSave(note.trim(), tags)}
            className="flex-1 items-center rounded-xl bg-emerald-600 py-3 active:bg-emerald-700"
          >
            <Text className="text-base font-semibold text-white">Save</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
