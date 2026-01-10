import { StatusBar } from "expo-status-bar";
import { View, KeyboardAvoidingView, Platform, Pressable, Keyboard } from "react-native";
import AppHeader from "../components/AppHeader";
import CountrySelector from "../components/CountrySelector";
import PhoneInput from "../components/PhoneInput";
import StartChatButton from "../components/StartChatButton";
import ProTipCard from "../components/ProTipCard";
import CountryModal from "../components/CountryModal";
import { useAppStore } from "../store/useAppStore";

export default function App() {
  const startChat = useAppStore((state) => state.startChat);
  const isValidNumber = useAppStore((state) => state.isValidNumber());

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <Pressable onPress={Keyboard.dismiss} className="flex-1">
        <View className="flex-1 bg-linear-to-b from-emerald-200 to-white dark:from-gray-900 dark:to-gray-800">
          <AppHeader />

          <View className="flex-1 px-5">
            <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl">
              <CountrySelector />
              <PhoneInput />
              <StartChatButton onPress={startChat} isValid={isValidNumber} />
            </View>

            <ProTipCard />
          </View>

          <CountryModal />

          <StatusBar style="auto" />
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
