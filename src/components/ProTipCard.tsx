import { Text, View } from "react-native";

export default function ProTipCard() {
  return (
    <View className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-4 mt-5 flex-row items-center">
      <Text className="text-2xl mr-3">💡</Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Pro Tip</Text>
        <Text className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Include the full phone number with area code for best results</Text>
      </View>
    </View>
  );
}
