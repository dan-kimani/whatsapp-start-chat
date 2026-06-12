import { Check, ChevronDown, Plus, Star, Tag, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useIsDark } from "../../hooks/useIsDark";

interface Props {
  filter: string;
  todayCount: number;
  priorityCount: number;
  allTags: string[];
  onFilterChange: (filter: string) => void;
  onTagPickerOpen: () => void;
  onCreateTag: (name: string) => void;
}

export default function FilterBar({
  filter,
  todayCount,
  priorityCount,
  allTags,
  onFilterChange,
  onTagPickerOpen,
  onCreateTag,
}: Props) {
  const isDark = useIsDark();
  const isTagActive = filter !== "all" && filter !== "today" && filter !== "priority";

  const [isAdding, setIsAdding] = useState(false);
  const [tagName, setTagName] = useState("");

  const handleCreate = () => {
    const trimmed = tagName.trim();
    if (trimmed) onCreateTag(trimmed);
    setTagName("");
    setIsAdding(false);
  };

  const handleCancel = () => {
    setTagName("");
    setIsAdding(false);
  };

  return (
    <View className="flex-row flex-wrap gap-2 px-4 pb-2">
      {/* My Day */}
      <Pressable
        onPress={() => onFilterChange(filter === "today" ? "all" : "today")}
        className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${filter === "today" ? "border-emerald-600 bg-emerald-600" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
      >
        <Text
          className={`text-[13px] font-semibold ${filter === "today" ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
        >
          My Day
        </Text>
        {todayCount > 0 && (
          <View
            className={`rounded-full px-1.5 py-0.5 ${filter === "today" ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <Text
              className={`text-[11px] font-bold ${filter === "today" ? "text-white" : "text-gray-500 dark:text-gray-300"}`}
            >
              {todayCount}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Priority */}
      <Pressable
        onPress={() => onFilterChange(filter === "priority" ? "all" : "priority")}
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
        {priorityCount > 0 && (
          <View
            className={`rounded-full px-1.5 py-0.5 ${filter === "priority" ? "bg-amber-400" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            <Text
              className={`text-[11px] font-bold ${filter === "priority" ? "text-white" : "text-gray-500 dark:text-gray-300"}`}
            >
              {priorityCount}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Tags button */}
      <Pressable
        onPress={onTagPickerOpen}
        className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${isTagActive ? "border-indigo-500 bg-indigo-500" : "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"}`}
      >
        <Tag size={13} color={isTagActive ? "#fff" : isDark ? "#9ca3af" : "#6b7280"} />
        <Text
          className={`text-[13px] font-semibold ${isTagActive ? "text-white" : "text-gray-900 dark:text-gray-50"}`}
        >
          {isTagActive ? filter : "Tags"}
        </Text>
        {!isTagActive && allTags.length > 0 && (
          <View className="rounded-full bg-gray-300 px-1.5 py-0.5 dark:bg-gray-600">
            <Text className="text-[11px] font-bold text-gray-500 dark:text-gray-300">
              {allTags.length}
            </Text>
          </View>
        )}
        {!isTagActive && <ChevronDown size={12} color={isDark ? "#9ca3af" : "#6b7280"} />}
        {isTagActive && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onFilterChange("all");
            }}
            hitSlop={8}
          >
            <X size={12} color="#fff" strokeWidth={3} />
          </Pressable>
        )}
      </Pressable>

      {/* Create tag */}
      {isAdding ? (
        <View className="flex-row items-center gap-1">
          <TextInput
            value={tagName}
            onChangeText={setTagName}
            onSubmitEditing={handleCreate}
            placeholder="Tag name"
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            autoFocus
            className="w-24 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-[13px] font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-50"
          />
          <Pressable
            onPress={handleCreate}
            className="h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 active:bg-indigo-600"
          >
            <Check size={14} color="#fff" strokeWidth={3} />
          </Pressable>
          <Pressable
            onPress={handleCancel}
            className="h-8 w-8 items-center justify-center rounded-lg bg-gray-300 active:bg-gray-400 dark:bg-gray-600"
          >
            <X size={14} color="#fff" strokeWidth={3} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={() => setIsAdding(true)}
          className="h-9 w-9 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:active:bg-gray-700"
        >
          <Plus size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
        </Pressable>
      )}
    </View>
  );
}
