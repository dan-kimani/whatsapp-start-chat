import { Pressable, Text, View } from "react-native";
import { useAppStore } from "../store/useAppStore";

interface StartChatButtonProps {
  onPress: () => void;
  isValid: boolean;
}

export default function StartChatButton({ onPress, isValid }: StartChatButtonProps) {
  const { isPressed, setIsPressed } = useAppStore((state) => state);

  return (
    <>
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={!isValid}
        className={`rounded-2xl py-4 items-center justify-center shadow-lg ${isValid ? (isPressed ? "bg-emerald-600" : "bg-emerald-500") : "bg-gray-300 dark:bg-gray-600"}`}
      >
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">📱</Text>
          <Text className={`text-lg font-bold ${isValid ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>Start WhatsApp Chat</Text>
        </View>
      </Pressable>
      <Text className="text-center text-gray-400 dark:text-gray-500 text-sm mt-4">Opens WhatsApp directly — no contact saving needed</Text>
    </>
  );
}
