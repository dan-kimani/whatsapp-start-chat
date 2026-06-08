import { Check, MessageCircle, Pencil, RotateCcw, Trash2 } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

interface Props {
  visible: boolean;
  position: { top: number; right: number };
  mode: "active" | "completed";
  onClose: () => void;
  onWhatsApp: () => void;
  onEdit?: () => void;
  onComplete?: () => void;
  onReopen?: () => void;
  onDelete: () => void;
}

export default function ReminderMenu({
  visible,
  position,
  mode,
  onClose,
  onWhatsApp,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
}: Props) {
  if (!visible) return null;

  const item = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        className="absolute rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        style={{ top: position.top, right: position.right, minWidth: 170 }}
      >
        <Pressable
          onPress={() => item(onWhatsApp)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <MessageCircle size={16} color="#059669" />
          <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">WhatsApp</Text>
        </Pressable>

        {mode === "active" ? (
          <>
            <Pressable
              onPress={() => onEdit && item(onEdit)}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <Pencil size={16} color="#6b7280" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => onComplete && item(onComplete)}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <Check size={16} color="#059669" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Complete</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => onReopen && item(onReopen)}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <RotateCcw size={16} color="#2563eb" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Reopen</Text>
            </Pressable>
            <Pressable
              onPress={() => onEdit && item(onEdit)}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <Pencil size={16} color="#6b7280" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Reschedule</Text>
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => item(onDelete)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <Trash2 size={16} color="#ef4444" />
          <Text className="ml-3 text-sm text-red-500">Delete</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
