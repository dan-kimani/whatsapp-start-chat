import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Keyboard, View } from "react-native";

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
    <View className="flex-1">
      <AppHeader />

      <View className="px-5">
        <View className="mb-4 rounded-2xl bg-gray-50 p-5 dark:bg-gray-950">
          <CountrySelector />
          <PhoneInput />
          <StartChatButton isValid={isValidNumber} />
        </View>
      </View>

      <View className="flex-1" onStartShouldSetResponder={() => { Keyboard.dismiss(); return false; }}>
        <RecentContactsList />
      </View>

      <CountryPickerSheet />
    </View>
  );
}
