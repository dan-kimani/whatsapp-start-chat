import { Phone, MessageCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useAppStore } from "../store/useAppStore";

interface StartChatButtonProps {
  isValid: boolean;
}

export default function StartChatButton({ isValid }: StartChatButtonProps) {
  const startChat = useAppStore((s) => s.startChat);
  const startCall = useAppStore((s) => s.startCall);

  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={startCall}
        disabled={!isValid}
        className={`flex-1 items-center justify-center rounded-xl py-4 ${isValid ? "bg-gray-500 active:bg-gray-600" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        <View className="flex-row items-center justify-center">
          <Phone size={18} color={isValid ? "#fff" : "#9ca3af"} strokeWidth={2.5} />
          <Text
            className={`ml-2 text-base font-semibold ${isValid ? "text-white" : "text-gray-400 dark:text-gray-500"}`}
          >
            Call
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={startChat}
        disabled={!isValid}
        className={`flex-1 items-center justify-center rounded-xl py-4 ${isValid ? "bg-emerald-500 active:bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        <View className="flex-row items-center justify-center">
          <MessageCircle size={18} color={isValid ? "#fff" : "#9ca3af"} strokeWidth={2.5} />
          <Text
            className={`ml-2 text-base font-semibold ${isValid ? "text-white" : "text-gray-400 dark:text-gray-500"}`}
          >
            WhatsApp
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
