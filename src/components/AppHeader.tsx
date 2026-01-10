import { Text, View } from "react-native";

export default function AppHeader() {
  return (
    <View className="pt-16 pb-8 px-6">
      <View className="items-center mb-2">
        <View className="w-20 h-20 bg-emerald-500 rounded-3xl items-center justify-center mb-4 shadow-lg">
          <Text className="text-4xl">💬</Text>
        </View>
      </View>
      <Text className="text-3xl font-bold text-center text-gray-800 dark:text-white">Quick Chat</Text>
      <Text className="text-base text-center text-gray-500 dark:text-gray-400 mt-2">Start a WhatsApp conversation without saving the contact</Text>
    </View>
  );
}
