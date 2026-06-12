import "../global.css";

import { Host } from "@expo/ui";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { Uniwind } from "uniwind";

import { useAppStore } from "../store/useAppStore";

export default function Layout() {
  const notificationSound = useAppStore((s) => s.notificationSound);
  const theme = useAppStore((s) => s.theme);

  // Restore persisted theme on app startup
  useEffect(() => {
    Uniwind.setTheme(theme);
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: notificationSound,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, [notificationSound]);
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | null;
      if (data?.phoneNumber) {
        const digits = `${data.countryCode ?? ""}${data.phoneNumber}`.replace(/\D/g, "");
        const msgParam = data.message ? `&text=${encodeURIComponent(data.message)}` : "";
        Linking.openURL(`whatsapp://send?phone=+${digits}${msgParam}`);
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <Host style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-white dark:bg-gray-950">
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "default",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
          <Toast />
        </View>
      </GestureHandlerRootView>
    </Host>
  );
}
