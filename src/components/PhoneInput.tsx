import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Clipboard, X, Check, AlertTriangle, MessageSquarePlus } from "lucide-react-native";
import FormatBar, { applyFormat } from "./FormatBar";
import TemplateChips from "./TemplateChips";
import { useSmartClipboard } from "../hooks/useSmartClipboard";
import { useAppStore, formatPhoneNumber } from "../store/useAppStore";

const DIGITS_PER_COUNTRY: Record<string, number> = {
  KE: 9,
  US: 10,
  GB: 10,
  IN: 10,
  NG: 10,
  ZA: 9,
  TZ: 9,
  UG: 9,
  RW: 9,
  CN: 11,
  JP: 10,
  DE: 11,
  FR: 9,
  BR: 11,
  AE: 9,
  SA: 9,
  EG: 10,
};

function formatPlaceholder(countryCode: string): string {
  const count = DIGITS_PER_COUNTRY[countryCode] || 9;
  const digits = Array.from({ length: count }, (_, i) => (i + 1) % 10);
  return formatPhoneNumber(digits.join(""));
}

export default function PhoneInput() {
  const phoneNumber = useAppStore((state) => state.phoneNumber);
  const rawPhoneNumber = useAppStore((state) => state.rawPhoneNumber);
  const setPhoneNumber = useAppStore((state) => state.setPhoneNumber);
  const selectedCountryCode = useAppStore((state) => state.selectedCountryCode);
  const isValidNumber = useAppStore((state) => state.isValidNumber);
  const selectedCountry = useAppStore((state) => state.selectedCountry);
  const messageText = useAppStore((state) => state.messageText);
  const setMessageText = useAppStore((state) => state.setMessageText);
  const placeholder = formatPlaceholder(selectedCountry.country);

  const isValid = isValidNumber();
  const clipboardNumber = useSmartClipboard(rawPhoneNumber);
  const msgSelection = useRef({ start: 0, end: 0 });
  const [showMessage, setShowMessage] = useState(false);

  const handlePaste = () => {
    if (clipboardNumber) {
      setPhoneNumber(clipboardNumber);
    }
  };

  const getBorderStyle = () => {
    if (rawPhoneNumber.length === 0) return "border-gray-200 dark:border-gray-600";
    return isValid ? "border-emerald-400 dark:border-emerald-500" : "border-red-400 dark:border-red-500";
  };

  return (
    <>
      <View className="flex-row justify-between items-end mb-2 ml-1 mr-1">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">Phone number</Text>
        {clipboardNumber && (
          <Pressable onPress={handlePaste} className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full flex-row items-center active:bg-gray-200 dark:active:bg-gray-600">
            <Clipboard size={12} color="#6b7280" />
            <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium ml-1 mr-1">Paste</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-500 font-medium max-w-30" numberOfLines={1}>
              {clipboardNumber}
            </Text>
          </Pressable>
        )}
      </View>
      <View className={`flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-4 mb-2 border ${getBorderStyle()}`}>
        <Text className="text-lg text-gray-400 dark:text-gray-500 mr-2">{selectedCountryCode}</Text>
        <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder={placeholder} placeholderTextColor="#9CA3AF" keyboardType="phone-pad" className="flex-1 text-lg py-4 text-gray-900 dark:text-white" maxLength={20} />
        {phoneNumber.length > 0 && (
          <Pressable onPress={() => { setPhoneNumber(""); setShowMessage(false); }} className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full items-center justify-center active:bg-gray-400 dark:active:bg-gray-500">
            <X size={14} color="#fff" strokeWidth={3} />
          </Pressable>
        )}
      </View>
      {rawPhoneNumber.length > 0 && (
        <View className="flex-row justify-between items-center px-2 mb-2">
          <View className="flex-row items-center">
            {isValid ? <Check size={14} color="#059669" strokeWidth={3} /> : <AlertTriangle size={14} color="#ef4444" strokeWidth={3} />}
            <Text className={`text-sm ml-1 ${isValid ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>{isValid ? "Ready" : "Too short"}</Text>
          </View>
          <Text className="text-sm text-gray-400 dark:text-gray-500">{rawPhoneNumber.length} / 15</Text>
        </View>
      )}

      {/* Message pre-fill */}
      {isValid && !showMessage && (
        <Pressable onPress={() => setShowMessage(true)} className="flex-row items-center mb-6 px-1 py-4">
          <MessageSquarePlus size={16} color="#6b7280" />
          <Text className="text-sm text-gray-400 dark:text-gray-500 ml-2">Add a message</Text>
        </Pressable>
      )}
      {isValid && showMessage && (
        <View className="mb-6 px-1">
          <TemplateChips onSelect={setMessageText} />
          <FormatBar
            onFormat={(wrapper, line) => {
              const next = applyFormat(messageText, msgSelection.current, wrapper, line);
              setMessageText(next);
            }}
          />
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            onSelectionChange={(e) => { msgSelection.current = e.nativeEvent.selection; }}
            placeholder="Type a message to send..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
            style={{ minHeight: 60, textAlignVertical: "top" }}
            maxLength={500}
          />
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">{messageText.length}/500</Text>
        </View>
      )}
    </>
  );
}
