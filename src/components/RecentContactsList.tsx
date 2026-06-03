import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";
import { Trash2, Clock, MessageCircle, UserPlus, Phone } from "lucide-react-native";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { CountryCode } from "react-native-country-picker-modal";
import CountryFlag from "react-native-country-flag";
import { useAppStore, formatPhoneNumber } from "../store/useAppStore";

interface RecentContact {
  phoneNumber: string;
  countryCode: string;
  country: string;
  flag: string;
  usedAt: Date;
}

export default function RecentContactsList() {
  const recentContacts = useAppStore((state) => state.recentContacts);
  const selectRecentContact = useAppStore((state) => state.selectRecentContact);
  const deleteRecentContact = useAppStore((state) => state.deleteRecentContact);
  const openWhatsApp = useAppStore((state) => state.openWhatsApp);
  const openDialer = useAppStore((state) => state.openDialer);
  const saveContact = useAppStore((state) => state.saveContact);
  const loadRecentContacts = useAppStore((state) => state.loadRecentContacts);

  useEffect(() => {
    loadRecentContacts();
  }, []);

  if (recentContacts.length === 0) {
    return (
      <View className="mb-4 px-1">
        <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">Recent</Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Numbers you message will appear here</Text>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-1">Recent</Text>
      <FlatList
        scrollEnabled={false}
        data={recentContacts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item) => item.phoneNumber}
        renderItem={({ item: contact }) => (
          <ContactItem
            contact={contact}
            onSelect={selectRecentContact}
            onDelete={() => deleteRecentContact(contact.phoneNumber)}
            onCall={() => openDialer(contact.countryCode, contact.phoneNumber)}
            onOpenWhatsApp={() => openWhatsApp(contact.countryCode, contact.phoneNumber)}
            onSaveContact={() => saveContact(contact.countryCode, contact.phoneNumber)}
          />
        )}
      />
    </View>
  );
}

function ContactItem({
  contact,
  onSelect,
  onDelete,
  onCall,
  onOpenWhatsApp,
  onSaveContact,
}: {
  contact: RecentContact;
  onSelect: (c: RecentContact) => void;
  onDelete: () => void;
  onCall: () => void;
  onOpenWhatsApp: () => void;
  onSaveContact: () => void;
}) {
  const RightAction = (_prog: SharedValue<number>, _drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ scale: Math.min(Math.max(_prog.value, 0), 1.2) }],
      opacity: _prog.value,
    }));

    return (
      <View className="bg-red-500 justify-center items-end pr-6 rounded-xl mb-3 w-25">
        <Reanimated.View style={styleAnimation}>
          <Trash2 color="white" size={22} />
        </Reanimated.View>
      </View>
    );
  };

  const handleSwipeableOpen = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete();
  };

  return (
    <ReanimatedSwipeable friction={2} rightThreshold={40} overshootRight={false} renderRightActions={RightAction} onSwipeableOpen={handleSwipeableOpen} containerStyle={{ overflow: "visible" }}>
      <Pressable
        onPress={() => onSelect(contact)}
        className="bg-white dark:bg-gray-800 rounded-xl mb-3 overflow-hidden active:bg-gray-50 dark:active:bg-gray-700"
      >
        <View className="flex-row">
          {/* Left accent */}
          <View className="w-1 bg-emerald-400 dark:bg-emerald-600" />

          <View className="flex-1 p-4 pl-4">
            {/* Number + flag row */}
            <View className="flex-row items-center">
              <View className="mr-3 rounded-md overflow-hidden">
                <CountryFlag isoCode={contact.country as CountryCode} size={28} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white tracking-wide">
                  {contact.countryCode} {formatPhoneNumber(contact.phoneNumber)}
                </Text>
                <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {contact.country}
                </Text>
              </View>
            </View>

            {/* Actions row */}
            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
              <View className="flex-row items-center">
                <Clock size={12} color="#9ca3af" />
                <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                  {formatDistanceToNow(contact.usedAt, { addSuffix: true })}
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Pressable onPress={onCall} className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full active:bg-blue-200 dark:active:bg-blue-900/60" hitSlop={6}>
                  <Phone size={16} color="#2563eb" />
                </Pressable>
                <Pressable onPress={onOpenWhatsApp} className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-full active:bg-emerald-200 dark:active:bg-emerald-900/60" hitSlop={6}>
                  <MessageCircle size={16} color="#059669" />
                </Pressable>
                <Pressable onPress={onSaveContact} className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-600" hitSlop={6}>
                  <UserPlus size={16} color="#6b7280" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}
