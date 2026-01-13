import { StatusBar } from "expo-status-bar";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, View } from "react-native";

import AppHeader from "../components/AppHeader";
import CountrySelector from "../components/CountrySelector";
import PhoneInput from "../components/PhoneInput";
import ProTipCard from "../components/ProTipCard";
import RecentContactsList from "../components/RecentContactsList";
import StartChatButton from "../components/StartChatButton";
import { useAppStore } from "../store/useAppStore";

export default function App() {
  const startChat = useAppStore((state) => state.startChat);
  const isValidNumber = useAppStore((state) => state.isValidNumber());

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <StatusBar style="auto" />
      <Pressable onPress={Keyboard.dismiss} className="flex-1">
        <View className="flex-1 bg-linear-to-b from-emerald-200 to-white dark:from-gray-900 dark:to-gray-800">
          <AppHeader />

          <View className="flex-1 px-5">
            <View className="bg-emerald-50 dark:bg-gray-800 rounded-3xl p-6 shadow-xl mb-4">
              <CountrySelector />
              <PhoneInput />
              <StartChatButton onPress={startChat} isValid={isValidNumber} />
            </View>

            <RecentContactsList />

            <ProTipCard />
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
