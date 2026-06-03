import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle } from "lucide-react-native";

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 16 }} className="pb-4 px-6">
      <View className="flex-row items-center mb-3">
        <View className="mr-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
          <MessageCircle size={24} color="#059669" />
        </View>
        <View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
            WhatsApp Quick Chat
          </Text>
        </View>
      </View>
      <Text className="text-base text-gray-500 dark:text-gray-400 leading-6">
        Open a chat with any number — nothing saved to your contacts.
      </Text>
    </View>
  );
}
