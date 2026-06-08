import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Keyboard, View } from "react-native";

import AppHeader from "../components/AppHeader";
import RecentContactsList from "../components/Contacts/RecentContactsList";
import CountryPickerSheet from "../components/Country/CountryPickerSheet";
import CountryTrigger from "../components/Country/CountryTrigger";
import PhoneInput from "../components/Phone/PhoneInput";
import StartChatButton from "../components/Phone/StartChatButton";
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
          <CountryTrigger />
          <PhoneInput />
          <StartChatButton isValid={isValidNumber} />
        </View>
      </View>

      <View
        className="flex-1"
        onStartShouldSetResponder={() => {
          Keyboard.dismiss();
          return false;
        }}
      >
        <RecentContactsList />
      </View>

      <CountryPickerSheet />
    </View>
  );
}
