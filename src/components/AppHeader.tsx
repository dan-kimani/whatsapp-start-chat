import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MessageCircle, Megaphone, MessageSquareText, Bell } from "lucide-react-native";

export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top + 16 }} className="pb-4 px-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="mr-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
            <MessageCircle size={24} color="#059669" />
          </View>
          <View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
              WhatsApp Link
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => router.push("/reminders")}
            className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl active:bg-gray-200 dark:active:bg-gray-600"
          >
            <Bell size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/templates")}
            className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl active:bg-gray-200 dark:active:bg-gray-600"
          >
            <MessageSquareText size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push("/broadcast")}
            className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-xl active:bg-emerald-200 dark:active:bg-emerald-900/60"
          >
            <Megaphone size={20} color="#059669" />
          </Pressable>
        </View>
      </View>
      <Text className="text-base text-gray-500 dark:text-gray-400 leading-6">
        Open a chat with any number — nothing saved to your contacts.
      </Text>
    </View>
  );
}
