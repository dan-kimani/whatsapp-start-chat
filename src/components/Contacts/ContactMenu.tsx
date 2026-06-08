import { Bell, MessageCircle, Pencil, Phone, UserPlus } from "lucide-react-native";
import { Modal, Pressable, Text, View } from "react-native";

interface Props {
  visible: boolean;
  position: { top: number; right: number };
  onClose: () => void;
  onCall: () => void;
  onOpenWhatsApp: () => void;
  onSaveContact: () => void;
  onAddNote: () => void;
  onRemind: () => void;
}

export default function ContactMenu({
  visible,
  position,
  onClose,
  onCall,
  onOpenWhatsApp,
  onSaveContact,
  onAddNote,
  onRemind,
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
        style={{ top: position.top, right: position.right, minWidth: 180 }}
      >
        <Pressable
          onPress={() => item(onCall)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <Phone size={16} color="#2563eb" />
          <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Call</Text>
        </Pressable>
        <Pressable
          onPress={() => item(onOpenWhatsApp)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <MessageCircle size={16} color="#059669" />
          <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">WhatsApp</Text>
        </Pressable>
        <Pressable
          onPress={() => item(onSaveContact)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <UserPlus size={16} color="#6b7280" />
          <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Save contact</Text>
        </Pressable>
        <Pressable
          onPress={() => item(onAddNote)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <Pencil size={16} color="#8b5cf6" />
          <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Add note</Text>
        </Pressable>
        <Pressable
          onPress={() => item(onRemind)}
          className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
        >
          <Bell size={16} color="#d97706" />
          <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Set reminder</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
