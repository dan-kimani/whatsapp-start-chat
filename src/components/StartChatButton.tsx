import { Pressable, Text, View } from "react-native";
import { Phone } from "lucide-react-native";

interface StartChatButtonProps {
  onPress: () => void;
  isValid: boolean;
}

export default function StartChatButton({ onPress, isValid }: StartChatButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!isValid}
      className={`rounded-xl py-4 items-center justify-center ${isValid ? "bg-emerald-500 active:bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"}`}
    >
      <View className="flex-row items-center">
        <Phone size={20} color={isValid ? "#fff" : "#9ca3af"} strokeWidth={2.5} />
        <Text className={`text-lg font-semibold ml-2 ${isValid ? "text-white" : "text-gray-400 dark:text-gray-500"}`}>
          Open in WhatsApp
        </Text>
      </View>
    </Pressable>
  );
}
