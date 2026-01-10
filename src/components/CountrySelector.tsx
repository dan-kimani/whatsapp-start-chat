import { Pressable, Text, View } from "react-native";
import { useAppStore } from "../store/useAppStore";

export default function CountrySelector() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const setModalVisible = useAppStore((state) => state.setModalVisible);
  return (
    <>
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 ml-1">Country Code</Text>
      <Pressable onPress={() => setModalVisible(true)} className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-4 mb-5 active:bg-gray-100 dark:active:bg-gray-600">
        <Text className="text-2xl mr-3">{selectedCountry.flag}</Text>
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">{selectedCountry.code}</Text>
        <Text className="text-gray-500 dark:text-gray-400 ml-2">({selectedCountry.country})</Text>
        <View className="flex-1" />
        <Text className="text-gray-400 text-xl">▼</Text>
      </Pressable>
    </>
  );
}
