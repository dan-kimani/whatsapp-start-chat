import { ChevronDown } from "lucide-react-native";
import { Pressable, Text, View, useColorScheme } from "react-native";
import CountryFlag from "react-native-country-flag";
import type { CountryCode } from "react-native-country-picker-modal";

import { useAppStore } from "../../store/useAppStore";

export default function CountryTrigger() {
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const setOpen = useAppStore((s) => s.setCountryPickerOpen);
  const isDark = useColorScheme() === "dark";

  return (
    <>
      <Text className="mb-2 ml-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
        Country
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="mb-5 overflow-hidden rounded-xl bg-gray-50 active:bg-gray-100 dark:bg-gray-700 dark:active:bg-gray-600"
      >
        <View className="w-full flex-row items-center px-4 py-4">
          <CountryFlag isoCode={selectedCountry.country as CountryCode} size={24} />
          <Text className="mr-1 ml-2 text-lg font-semibold text-gray-800 dark:text-white">
            {selectedCountry.code}
          </Text>
          <ChevronDown size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
          <Text className="ml-2 text-sm text-gray-400 dark:text-gray-500">
            ({selectedCountry.country})
          </Text>
        </View>
      </Pressable>
    </>
  );
}
