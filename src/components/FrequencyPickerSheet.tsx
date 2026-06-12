import { useEffect, useRef } from "react";
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

interface Props {
  visible: boolean;
  selected: "hourly" | "daily" | "weekly";
  onSelect: (freq: "hourly" | "daily" | "weekly") => void;
  onClose: () => void;
}

const OPTIONS: { key: "hourly" | "daily" | "weekly"; label: string }[] = [
  { key: "hourly", label: "Hourly" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
];

export default function FrequencyPickerSheet({ visible, selected, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const translateY = useRef(new Animated.Value(0)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const sheetHeight = 300 + insets.bottom;

  useEffect(() => {
    if (visible) {
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
    }
  }, [visible, sheetHeight, translateY, backdrop]);

  const close = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, { toValue: sheetHeight, duration: 180, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!visible) return null;

  const bg = isDark ? "#1f2937" : "#ffffff";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";
  const activeBg = isDark ? "#064e3b" : "#ecfdf5";
  const sep = isDark ? "#374151" : "#f3f4f6";

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

        <Text
          className="mb-1 px-6 text-lg font-bold"
          style={{ color: textColor }}
        >
          Backup frequency
        </Text>

        <View style={{ height: 1, backgroundColor: sep, marginTop: 12 }} />

        {OPTIONS.map((opt) => {
          const active = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                onSelect(opt.key);
                close();
              }}
              style={({ pressed }) => [
                pressed && { backgroundColor: isDark ? "#374151" : "#f3f4f6" },
                active && { backgroundColor: activeBg },
              ]}
              className="flex-row items-center justify-between px-6 py-4"
            >
              <Text
                className="text-[16px]"
                style={{ color: active ? "#059669" : textColor, fontWeight: active ? "600" : "400" }}
              >
                {opt.label}
              </Text>
              {active && (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <View className="h-2 w-2 rounded-full bg-white" />
                </View>
              )}
            </Pressable>
          );
        })}

        <View className="mt-2 px-6">
          <Pressable
            onPress={close}
            style={({ pressed }) => [
              pressed && { backgroundColor: isDark ? "#374151" : "#e5e7eb" },
              { backgroundColor: isDark ? "#1f2937" : "#f3f4f6" },
            ]}
            className="items-center rounded-xl py-3.5"
          >
            <Text className="text-[15px] font-semibold" style={{ color: mutedColor }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
