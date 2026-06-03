import { StatusBar } from "expo-status-bar";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";

import AppHeader from "../components/AppHeader";
import { CountrySelector, CountryPickerSheet } from "../components/CountrySelector";
import PhoneInput from "../components/PhoneInput";
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
        <ScrollView
          className="flex-1 bg-white dark:bg-gray-950"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader />

          <View className="px-5">
            <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 mb-4">
              <CountrySelector />
              <PhoneInput />
              <StartChatButton onPress={startChat} isValid={isValidNumber} />
            </View>

            <RecentContactsList />
          </View>
        </ScrollView>
      </Pressable>

      {/* Rendered outside ScrollView so FlatList isn't nested */}
      <CountryPickerSheet />
    </KeyboardAvoidingView>
  );
}
