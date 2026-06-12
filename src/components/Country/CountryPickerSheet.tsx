import { Search } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import type { Country as PickerCountry } from "react-native-country-picker-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { loadCountries, useAppStore } from "../../store/useAppStore";
import { useIsDark } from "../../hooks/useIsDark";

const ROW_HEIGHT = 52;
const SHEET_RATIO = 0.75;

function getCountryName(country: PickerCountry): string {
  if (typeof country.name === "string") return country.name;
  return country.name.common || Object.values(country.name)[0] || country.cca2;
}

export default function CountryPickerSheet() {
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const setSelectedCountry = useAppStore((s) => s.setSelectedCountry);
  const isOpen = useAppStore((s) => s.isCountryPickerOpen);
  const setOpen = useAppStore((s) => s.setCountryPickerOpen);

  const [countries, setCountries] = useState<PickerCountry[]>([]);
  const [query, setQuery] = useState("");
  const pendingSelection = useRef<PickerCountry | null>(null);

  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();
  const listRef = useRef<FlatList<PickerCountry>>(null);
  const searchRef = useRef<TextInput>(null);

  const sheetHeight = screenHeight * SHEET_RATIO;
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (isOpen) {
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
        setTimeout(() => searchRef.current?.focus(), 350);
      });
    }
  }, [isOpen]);

  const close = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, { toValue: sheetHeight, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setOpen(false);
      setQuery("");
      // Apply pending selection after close animation to avoid flash
      if (pendingSelection.current) {
        setSelectedCountry({
          code: `+${pendingSelection.current.callingCode[0]}`,
          country: pendingSelection.current.cca2,
          flag: pendingSelection.current.flag || "",
        });
        pendingSelection.current = null;
      }
    });
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return countries;
    const q = query.toLowerCase().trim();
    return countries.filter((c) => {
      const name = getCountryName(c).toLowerCase();
      const code = c.callingCode?.[0] ?? "";
      return name.includes(q) || code.includes(q) || c.cca2.toLowerCase().includes(q);
    });
  }, [countries, query]);

  const select = (country: PickerCountry) => {
    pendingSelection.current = country;
    close();
  };

  const selectedIndex = useMemo(
    () => filtered.findIndex((c) => c.cca2 === selectedCountry.country),
    [filtered, selectedCountry.country],
  );

  const bg = isDark ? "#1f2937" : "#ffffff";
  const surfaceBg = isDark ? "#374151" : "#f3f4f6";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const mutedColor = isDark ? "#9ca3af" : "#6b7280";
  const sep = isDark ? "#374151" : "#f3f4f6";
  const highlight = isDark ? "#374151" : "#f0fdf4";

  if (!isOpen) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent={false}
      onRequestClose={close}
    >
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
            height: sheetHeight + insets.bottom,
            backgroundColor: bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: insets.bottom,
          },
          { transform: [{ translateY }] },
        ]}
      >
        <View className="items-center pt-3 pb-1">
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 3,
              backgroundColor: isDark ? "#4b5563" : "#d1d5db",
            }}
          />
        </View>
        <View className="px-4 pt-2 pb-3">
          <View
            className="flex-row items-center rounded-xl px-3 py-2.5"
            style={{ backgroundColor: surfaceBg }}
          >
            <Search size={18} color={mutedColor} />
            <TextInput
              ref={searchRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Search country"
              placeholderTextColor={mutedColor}
              className="ml-2 flex-1 text-base"
              style={{ color: textColor }}
              clearButtonMode="while-editing"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: sep }} />
        <FlatList
          key={countries.length > 0 ? "loaded" : "loading"}
          ref={listRef}
          data={filtered}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={5}
          getItemLayout={(_, i) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * i, index: i })}
          initialScrollIndex={selectedIndex > 0 ? selectedIndex : 0}
          onScrollToIndexFailed={() => {
            if (selectedIndex > 0 && selectedIndex < filtered.length) {
              setTimeout(
                () => listRef.current?.scrollToIndex({ index: selectedIndex, animated: false }),
                100,
              );
            }
          }}
          renderItem={({ item }) => {
            const active = item.cca2 === selectedCountry.country;
            return (
              <Pressable
                onPress={() => select(item)}
                style={{ height: ROW_HEIGHT, backgroundColor: active ? highlight : "transparent" }}
                className="flex-row items-center px-4"
              >
                <CountryFlag isoCode={item.cca2} size={22} />
                <View className="ml-3 flex-1">
                  <Text className="text-base" style={{ color: textColor }} numberOfLines={1}>
                    {getCountryName(item)}
                  </Text>
                </View>
                <Text className="ml-2 text-sm" style={{ color: mutedColor }}>
                  +{item.callingCode?.[0]}
                </Text>
                {active && <View className="ml-2 h-3 w-3 rounded-full bg-emerald-500" />}
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: sep, marginLeft: 52 }} />
          )}
        />
      </Animated.View>
    </Modal>
  );
}
