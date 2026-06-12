import { Tag, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useIsDark } from "../../hooks/useIsDark";

interface Props {
  visible: boolean;
  tags: string[];
  tagCounts: Record<string, number>;
  insetsBottom: number;
  onSelect: (tag: string) => void;
  onDelete: (tag: string) => void;
  onClose: () => void;
}

export default function TagPickerModal({
  visible,
  tags,
  tagCounts,
  insetsBottom,
  onSelect,
  onDelete,
  onClose,
}: Props) {
  const isDark = useIsDark();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} onPress={onClose} />
      <View
        className="absolute bottom-0 w-full rounded-t-3xl bg-white px-4 pt-5 dark:bg-gray-900"
        style={{ maxHeight: "60%", paddingBottom: insetsBottom + 16 }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">Tags</Text>
          <Pressable onPress={onClose} className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
            <X size={16} color={isDark ? "#9ca3af" : "#6b7280"} strokeWidth={2.5} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: "100%" }}>
          <View className="flex-row flex-wrap gap-2 pb-2">
            {tags.length === 0 && (
              <Text className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                No tags yet. Tap + to create one.
              </Text>
            )}
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => onSelect(tag)}
                onLongPress={() => onDelete(tag)}
                className="flex-row items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 active:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
              >
                <Tag size={13} color="#4f46e5" />
                <Text className="text-[13px] font-semibold text-gray-900 dark:text-gray-50">
                  {tag}
                </Text>
                <View className="rounded-full bg-gray-300 px-1.5 py-0.5 dark:bg-gray-600">
                  <Text className="text-[11px] font-bold text-gray-500 dark:text-gray-300">
                    {tagCounts[tag] ?? 0}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
