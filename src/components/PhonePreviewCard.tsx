import { Text, View } from "react-native";
import { useAppStore } from "../store/useAppStore";

export default function PhonePreviewCard() {
  const phoneNumber = useAppStore((state) => state.phoneNumber);
  const rawPhoneNumber = useAppStore((state) => state.rawPhoneNumber);
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const isValid = useAppStore((state) => state.isValidNumber());

  if (rawPhoneNumber.length === 0) return null;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">FULL NUMBER PREVIEW</Text>
      <View className="flex-row items-center">
        <Text className="text-3xl mr-2">{selectedCountry.flag}</Text>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedCountry.code} {phoneNumber}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedCountry.country}</Text>
        </View>
        {isValid && (
          <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
            <Text className="text-green-700 dark:text-green-300 text-xs font-bold">✓ READY</Text>
          </View>
        )}
      </View>
    </View>
  );
}
