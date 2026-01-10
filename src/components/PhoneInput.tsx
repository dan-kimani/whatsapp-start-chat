import { Pressable, Text, TextInput, View } from "react-native";
import { useAppStore } from "../store/useAppStore";

export default function PhoneInput() {
  const { phoneNumber, setPhoneNumber, selectedCountry } = useAppStore((state) => state);
  const countryCode = selectedCountry.code;

  return (
    <>
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 ml-1">Phone Number</Text>
      <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 mb-6">
        <Text className="text-lg text-gray-500 dark:text-gray-400 mr-2">{countryCode}</Text>
        <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Enter phone number" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" className="flex-1 text-lg py-4 text-gray-800 dark:text-white" />
        {phoneNumber.length > 0 && (
          <Pressable onPress={() => setPhoneNumber("")}>
            <View className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">✕</Text>
            </View>
          </Pressable>
        )}
      </View>
    </>
  );
}
