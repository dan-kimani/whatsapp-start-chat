import { useEffect } from "react";
import { Keyboard, Pressable, View } from "react-native";
import * as Notifications from "expo-notifications";

import AppHeader from "../components/AppHeader";
import { CountrySelector, CountryPickerSheet } from "../components/CountrySelector";
import PhoneInput from "../components/PhoneInput";
import RecentContactsList from "../components/RecentContactsList";
import StartChatButton from "../components/StartChatButton";
import { useAppStore } from "../store/useAppStore";

export default function App() {
  const isValidNumber = useAppStore((state) => state.isValidNumber());
  const requestContactsPermission = useAppStore((state) => state.requestContactsPermission);

  useEffect(() => {
    requestContactsPermission();
    Notifications.requestPermissionsAsync();
  }, []);

  return (
    <Pressable onPress={Keyboard.dismiss} className="flex-1">
      <AppHeader />

      <View className="px-5">
        <View className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-5 mb-4">
          <CountrySelector />
          <PhoneInput />
          <StartChatButton isValid={isValidNumber} />
        </View>
      </View>

      <RecentContactsList />

      <CountryPickerSheet />
    </Pressable>
  );
}
