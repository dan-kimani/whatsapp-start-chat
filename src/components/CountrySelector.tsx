import { useState } from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import CountryPicker, { Country, CountryCode, DARK_THEME } from "react-native-country-picker-modal";
import { useAppStore } from "../store/useAppStore";

export default function CountrySelector() {
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const setSelectedCountry = useAppStore((state) => state.setSelectedCountry);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const onSelectCountry = (country: Country) => {
    setSelectedCountry({
      code: `+${country.callingCode[0]}`,
      country: country.cca2 as string,
      flag: country.flag as string, // Note: this might be empty depending on library version/props, but usually fine
    });
    setIsPickerVisible(false);
  };

  const countryCode = selectedCountry.country as CountryCode;

  return (
    <>
      <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2 ml-1">Country Code</Text>
      <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl mb-5 active:bg-gray-100 dark:active:bg-gray-600 overflow-hidden">
        <CountryPicker
          countryCode={countryCode}
          withFlag
          withCallingCode
          withCallingCodeButton
          withFlagButton
          withFilter
          withModal
          visible={isPickerVisible}
          onSelect={onSelectCountry}
          onClose={() => setIsPickerVisible(false)}
          onOpen={() => setIsPickerVisible(true)}
          renderFlagButton={({ onOpen }) => (
            <Pressable onPress={onOpen} className="flex-row items-center px-4 py-4 w-full">
              <CountryPicker countryCode={countryCode} withFlag withCallingCodeButton={false} withCountryNameButton={false} onSelect={() => {}} visible={false} theme={isDark ? DARK_THEME : undefined} />
              <Text className="ml-2 mr-1 text-lg font-semibold text-gray-800 dark:text-white">{selectedCountry.code}</Text>
              <View className="ml-1">
                <Text className="text-gray-400 text-xl">▼</Text>
              </View>
              <Text className="text-gray-500 dark:text-gray-400 ml-2">({selectedCountry.country})</Text>
            </Pressable>
          )}
          theme={isDark ? DARK_THEME : undefined}
          containerButtonStyle={{ alignItems: "center" }}
        />
      </View>
    </>
  );
}
