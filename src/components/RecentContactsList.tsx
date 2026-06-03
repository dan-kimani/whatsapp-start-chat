import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";
import { Trash2, Clock } from "lucide-react-native";
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
  const recentContacts = useAppStore((state) => state.recentContacts);
  const selectRecentContact = useAppStore((state) => state.selectRecentContact);
  const deleteRecentContact = useAppStore((state) => state.deleteRecentContact);
  const loadRecentContacts = useAppStore((state) => state.loadRecentContacts);

  useEffect(() => {
    loadRecentContacts();
  }, []);

  const handleDelete = (phoneNumber: string) => {
    deleteRecentContact(phoneNumber);
  };

  if (recentContacts.length === 0) return null;

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
          <ContactItem contact={contact} onSelect={selectRecentContact} onDelete={handleDelete} />
        )}
      />
    </View>
  );
}

function ContactItem({
  contact,
  onSelect,
  onDelete,
}: {
  contact: RecentContact;
  onSelect: (c: RecentContact) => void;
  onDelete: (phone: string) => void;
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
    onDelete(contact.phoneNumber);
  };

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={RightAction}
      onSwipeableOpen={handleSwipeableOpen}
      containerStyle={{ overflow: "visible" }}
    >
      <Pressable
        onPress={() => onSelect(contact)}
        className="bg-white dark:bg-gray-800 rounded-xl mb-3 border border-gray-100 dark:border-gray-700 p-4 active:bg-gray-50 dark:active:bg-gray-700"
      >
        <View className="flex-row items-center">
          <View className="mr-3 rounded-md overflow-hidden">
            <CountryFlag isoCode={contact.country as CountryCode} size={28} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {contact.countryCode} {contact.phoneNumber}
            </Text>
            <View className="flex-row items-center mt-1">
              <Clock size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                {formatDistanceToNow(contact.usedAt, { addSuffix: true })}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}
