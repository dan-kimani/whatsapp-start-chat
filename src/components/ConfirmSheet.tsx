import { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ConfirmAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

interface Props {
  action: ConfirmAction | null;
  onClose: () => void;
}

export default function ConfirmSheet({ action, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const translateY = useRef(new Animated.Value(0)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const sheetHeight = 280 + insets.bottom;

  const open = useCallback(() => {
    translateY.setValue(sheetHeight);
    backdrop.setValue(0);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  }, [sheetHeight, translateY, backdrop]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, { toValue: sheetHeight, duration: 180, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [sheetHeight, translateY, backdrop, onClose]);

  useEffect(() => {
    if (action) open();
  }, [action, open]);

  if (!action) return null;

  const bg = isDark ? "#1f2937" : "#ffffff";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const destructive = action.destructive !== false;
  const accentBg = destructive ? (isDark ? "#7f1d1d" : "#fef2f2") : isDark ? "#064e3b" : "#ecfdf5";
  const accentText = destructive
    ? isDark
      ? "#fca5a5"
      : "#dc2626"
    : isDark
      ? "#6ee7b7"
      : "#059669";

  return (
    <Modal visible transparent animationType="none" onRequestClose={close}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Animated.View
        style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }, { opacity: backdrop }]}
      >
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: sheetHeight,
            backgroundColor: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: insets.bottom + 16,
          },
          { transform: [{ translateY }] },
        ]}
      >
        {/* Handle */}
        <View className="items-center pt-3 pb-4">
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 3,
              backgroundColor: isDark ? "#4b5563" : "#d1d5db",
            }}
          />
        </View>

        {/* Icon + text */}
        <View className="items-center px-6">
          <View
            className="mb-4 h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: accentBg }}
          >
            {action.icon}
          </View>
          <Text className="mb-2 text-center text-lg font-bold" style={{ color: textColor }}>
            {action.title}
          </Text>
          <Text className="text-center text-[15px] leading-5" style={{ color: mutedColor }}>
            {action.description}
          </Text>
        </View>

        {/* Buttons */}
        <View className="mt-6 flex-row gap-3 px-6">
          <Pressable
            onPressIn={close}
            style={({ pressed }) => [
              pressed && { backgroundColor: isDark ? "#374151" : "#e5e7eb" },
              { backgroundColor: isDark ? "#1f2937" : "#f3f4f6" },
            ]}
            className="flex-1 items-center rounded-xl py-3.5"
          >
            <Text className="text-[15px] font-semibold text-gray-600 dark:text-gray-400">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPressIn={() => {
              action.onConfirm();
              close();
            }}
            style={({ pressed }) => [pressed && { opacity: 0.8 }, { backgroundColor: accentText }]}
            className="flex-1 items-center rounded-xl py-3.5"
          >
            <Text className="text-[15px] font-semibold text-white">
              {action.confirmLabel ?? "Clear"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
