import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";
import { Trash2 } from "lucide-react-native";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { CountryCode } from "react-native-country-picker-modal";
import CountryFlag from "react-native-country-flag";
import { useAppStore } from "../store/useAppStore";

interface RecentContact {
  phoneNumber: string;
  countryCode: string;
  country: string;
  flag: string;
  usedAt: Date;
}

export default function RecentContactsList() {
  const { recentContacts, selectRecentContact, deleteRecentContact, loadRecentContacts } = useAppStore((state) => state);

  useEffect(() => {
    loadRecentContacts();
  }, []);

  const handleDelete = (phoneNumber: string) => {
    deleteRecentContact(phoneNumber);
  };

  if (recentContacts.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3 px-1">
        <Text className="text-sm font-bold text-gray-700 dark:text-gray-200">Recent Contacts</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{recentContacts.length} saved</Text>
      </View>
      <FlatList
        data={recentContacts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyExtractor={(item, index) => `${item.phoneNumber}-${index}`}
        renderItem={({ item: contact }) => <ContactItem contact={contact} onSelect={selectRecentContact} onDelete={handleDelete} />}
      />
    </View>
  );
}

function ContactItem({ contact, onSelect, onDelete }: { contact: RecentContact; onSelect: (c: RecentContact) => void; onDelete: (phone: string) => void }) {
  const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ scale: Math.min(Math.max(prog.value, 0), 1.2) }],
        opacity: prog.value,
      };
    });

    return (
      <View className="bg-red-500 justify-center items-end pr-6 rounded-2xl mb-3 w-25">
        <Reanimated.View style={styleAnimation}>
          <Trash2 color="white" size={24} />
        </Reanimated.View>
      </View>
    );
  };

  const handleSwipeableOpen = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete(contact.phoneNumber);
  };

  return (
    <ReanimatedSwipeable friction={2} enableTrackpadTwoFingerGesture rightThreshold={40} overshootRight={false} renderRightActions={RightAction} onSwipeableOpen={handleSwipeableOpen} containerStyle={{ overflow: "visible" }}>
      <Pressable onPress={() => onSelect(contact)} className="bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl mb-3 border-2 border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="mr-3 rounded-md overflow-hidden">
              <CountryFlag isoCode={contact.country as CountryCode} size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">{contact.country}</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-white">
                {contact.countryCode} {contact.phoneNumber}
              </Text>
            </View>
          </View>
          <View className="bg-emerald-100 dark:bg-emerald-900 px-3 py-2 rounded-full">
            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">TAP TO USE</Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-xs text-gray-400 dark:text-gray-500">🕐 {formatDistanceToNow(contact.usedAt, { addSuffix: true })}</Text>
          <Text className="text-xs text-gray-300 dark:text-gray-600 italic">Swipe left to remove</Text>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}
