import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useAppStore, COUNTRY_CODES } from "../store/useAppStore";

export default function CountryModal() {
  const { modalVisible, setModalVisible, selectedCountry, setSelectedCountry } = useAppStore((state) => state);

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl max-h-[70%]">
          <View className="flex-row items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">Select Country</Text>
            <Pressable onPress={() => setModalVisible(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center">
              <Text className="text-gray-600 dark:text-gray-300 font-bold">✕</Text>
            </Pressable>
          </View>
          <ScrollView className="px-4 pb-8">
            {COUNTRY_CODES.map((country) => (
              <Pressable
                key={country.code}
                onPress={() => {
                  setSelectedCountry(country);
                  setModalVisible(false);
                }}
                className={`flex-row items-center py-4 px-3 rounded-xl mb-1 ${selectedCountry.code === country.code ? "bg-emerald-50 dark:bg-emerald-900/30" : "active:bg-gray-50 dark:active:bg-gray-700"}`}
              >
                <Text className="text-2xl mr-4">{country.flag}</Text>
                <Text className="text-lg text-gray-800 dark:text-white flex-1">{country.country}</Text>
                <Text className="text-lg font-semibold text-gray-600 dark:text-gray-400">{country.code}</Text>
                {selectedCountry.code === country.code && <Text className="text-emerald-500 ml-2 text-xl">✓</Text>}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
