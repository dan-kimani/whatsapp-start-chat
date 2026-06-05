import "../global.css";

import { useEffect } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Host } from "@expo/ui";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Layout() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host style={{ flex: 1 }} useViewportSizeMeasurement>
        <View className="flex-1 bg-white dark:bg-gray-950">
          <StatusBar style="auto" />
          <Slot />
          <Toast />
        </View>
      </Host>
    </GestureHandlerRootView>
  );
}
