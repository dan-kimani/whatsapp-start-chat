import { Pressable, Text, TextInput, View } from "react-native";
import { useSmartClipboard } from "../hooks/useSmartClipboard";
import { useAppStore } from "../store/useAppStore";

export default function PhoneInput() {
  const { phoneNumber, rawPhoneNumber, setPhoneNumber, selectedCountryCode, isValidNumber } = useAppStore((state) => state);

  const isValid = isValidNumber();
  const clipboardNumber = useSmartClipboard(rawPhoneNumber);

  const handlePaste = () => {
    if (clipboardNumber) {
      setPhoneNumber(clipboardNumber);
    }
  };

  const getBorderColor = () => {
    if (rawPhoneNumber.length === 0) return "border-gray-200 dark:border-gray-600";
    return isValid ? "border-green-400 dark:border-green-500" : "border-red-300 dark:border-red-500";
  };

  return (
    <>
      <View className="flex-row justify-between items-end mb-2 ml-1 mr-1">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">Phone Number</Text>
        {clipboardNumber && (
          <Pressable onPress={handlePaste}>
            <View className="bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1.5 rounded-full flex-row items-center border border-emerald-200 dark:border-emerald-800">
              <Text className="text-xs text-emerald-700 dark:text-emerald-300 font-bold mr-1">📋 Paste</Text>
              <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-medium max-w-30" numberOfLines={1}>
                {clipboardNumber}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
      <View className={`flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 mb-2 border-2 ${getBorderColor()}`}>
        <Text className="text-lg text-gray-500 dark:text-gray-400 mr-2">{selectedCountryCode}</Text>
        <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Enter phone number" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" className="flex-1 text-lg py-4 text-gray-800 dark:text-white" maxLength={20} />
        {phoneNumber.length > 0 && (
          <Pressable onPress={() => setPhoneNumber("")}>
            <View className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">✕</Text>
            </View>
          </Pressable>
        )}
      </View>
      {rawPhoneNumber.length > 0 && (
        <View className="flex-row justify-between items-center px-2 mb-6">
          <Text className={`text-sm ${isValid ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>{isValid ? "✓ Valid number" : "⚠ Invalid phone number"}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{rawPhoneNumber.length} / 15</Text>
        </View>
      )}
    </>
  );
}
