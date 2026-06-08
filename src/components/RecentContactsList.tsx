import { formatDistanceToNow } from "date-fns";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import {
  Trash2,
  Clock,
  MessageSquare,
  MoreVertical,
  Phone,
  MessageCircle,
  UserPlus,
  Bell,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { CountryCode } from "react-native-country-picker-modal";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { useAppStore, formatPhoneNumber, getCountryName } from "../store/useAppStore";
import ReminderSheet from "./ReminderSheet";

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
  const clearAllRecentContacts = useAppStore((state) => state.clearAllRecentContacts);
  const contactNames = useAppStore((state) => state.contactNames);
  const loadRecentContacts = useAppStore((state) => state.loadRecentContacts);
  const loadMoreRecentContacts = useAppStore((state) => state.loadMoreRecentContacts);
  const [refreshing, setRefreshing] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<{
    phoneNumber: string;
    countryCode: string;
    contactName?: string;
  } | null>(null);

  useEffect(() => {
    loadRecentContacts();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecentContacts();
    setRefreshing(false);
  }, [loadRecentContacts]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={recentContacts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyExtractor={(item) => item.phoneNumber}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onEndReached={loadMoreRecentContacts}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400">Recent</Text>
            {recentContacts.length > 0 && (
              <Pressable
                onPress={() => {
                  Alert.alert("Clear recent contacts?", "This will remove all saved numbers.", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive", onPress: clearAllRecentContacts },
                  ]);
                }}
              >
                <Text className="text-xs text-gray-400 dark:text-gray-500">Clear all</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            Numbers you message will appear here
          </Text>
        }
        renderItem={({ item: contact }) => (
          <ContactItem
            contact={contact}
            contactName={
              contactNames[`${contact.countryCode}${contact.phoneNumber}`.replace(/\D/g, "")] ||
              contactNames[contact.phoneNumber]
            }
            onSelect={selectRecentContact}
            onDelete={() => deleteRecentContact(contact.phoneNumber)}
            onCall={() => openDialer(contact.countryCode, contact.phoneNumber)}
            onOpenWhatsApp={() => openWhatsApp(contact.countryCode, contact.phoneNumber)}
            onSaveContact={() => saveContact(contact.countryCode, contact.phoneNumber)}
            onRemind={() =>
              setReminderTarget({
                phoneNumber: contact.phoneNumber,
                countryCode: contact.countryCode,
                contactName:
                  contactNames[`${contact.countryCode}${contact.phoneNumber}`.replace(/\D/g, "")] ||
                  contactNames[contact.phoneNumber] ||
                  undefined,
              })
            }
          />
        )}
      />
      <ReminderSheet
        visible={reminderTarget !== null}
        phoneNumber={reminderTarget?.phoneNumber ?? ""}
        countryCode={reminderTarget?.countryCode ?? ""}
        contactName={reminderTarget?.contactName}
        onClose={() => setReminderTarget(null)}
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
  onRemind,
  contactName,
}: {
  contact: RecentContact;
  contactName?: string;
  onSelect: (c: RecentContact) => void;
  onDelete: () => void;
  onCall: () => void;
  onOpenWhatsApp: () => void;
  onSaveContact: () => void;
  onRemind: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });
  const isDark = useColorScheme() === "dark";
  const { height: screenHeight } = useWindowDimensions();

  const RightAction = (_prog: SharedValue<number>, _drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ scale: Math.min(Math.max(_prog.value, 0), 1.2) }],
      opacity: _prog.value,
    }));

    return (
      <View className="w-25 items-end justify-center rounded-xl bg-red-500 pr-6">
        <Reanimated.View style={styleAnimation}>
          <Trash2 color="white" size={22} />
        </Reanimated.View>
      </View>
    );
  };

  const LeftAction = (_prog: SharedValue<number>, _drag: SharedValue<number>) => {
    const styleAnimation = useAnimatedStyle(() => ({
      transform: [{ scale: Math.min(Math.max(_prog.value, 0), 1.2) }],
      opacity: _prog.value,
    }));

    return (
      <View className="w-25 items-start justify-center rounded-xl bg-emerald-500 pl-6">
        <Reanimated.View style={styleAnimation}>
          <MessageSquare color="white" size={22} />
        </Reanimated.View>
      </View>
    );
  };

  const handleSwipeableOpen = (direction: "left" | "right") => {
    if (direction === "right") {
      const digits = `${contact.countryCode}${contact.phoneNumber}`.replace(/\D/g, "");
      Linking.openURL(`sms:+${digits}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  return (
    <View className="mb-3">
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        renderRightActions={RightAction}
        renderLeftActions={LeftAction}
        onSwipeableOpen={handleSwipeableOpen}
        containerStyle={{ overflow: "visible" }}
      >
        <Pressable
          onPress={() => onSelect(contact)}
          className="overflow-hidden rounded-xl bg-white active:bg-gray-50 dark:bg-gray-800 dark:active:bg-gray-700"
        >
          <View className="flex-row items-center px-4 py-3">
            <View className="mr-3 overflow-hidden rounded-md">
              <CountryFlag isoCode={contact.country as CountryCode} size={24} />
            </View>
            <View className="mr-2 flex-1">
              {contactName ? (
                <Text
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                  numberOfLines={1}
                >
                  {contactName}
                </Text>
              ) : (
                <Text
                  className="text-sm font-semibold text-gray-900 dark:text-white"
                  numberOfLines={1}
                >
                  {contact.countryCode} {formatPhoneNumber(contact.phoneNumber)}
                </Text>
              )}
              <View className="mt-0.5 flex-row items-center">
                <Clock size={10} color="#9ca3af" />
                <Text className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                  {formatDistanceToNow(contact.usedAt, { addSuffix: true })}
                  {contactName
                    ? ` · ${contact.countryCode} ${formatPhoneNumber(contact.phoneNumber)}`
                    : ` · ${getCountryName(contact.country)}`}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={(e) => {
                (e.target as any).measureInWindow(
                  (_x: number, y: number, _w: number, h: number) => {
                    const menuHeight = 200;
                    const flipped = y + h + menuHeight > screenHeight;
                    setMenuPos({ top: flipped ? y - menuHeight - 4 : y + h + 4, right: 16 });
                    setMenuOpen(true);
                  },
                );
              }}
              className="rounded-full bg-gray-100 p-1.5 active:bg-gray-200 dark:bg-gray-700 dark:active:bg-gray-600"
              hitSlop={6}
            >
              <MoreVertical size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>
          </View>
        </Pressable>
      </ReanimatedSwipeable>

      {menuOpen && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)} />
          <View
            className="absolute rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{ top: menuPos.top, right: menuPos.right, minWidth: 180 }}
          >
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                onCall();
              }}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <Phone size={16} color="#2563eb" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Call</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                onOpenWhatsApp();
              }}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <MessageCircle size={16} color="#059669" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">WhatsApp</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                onSaveContact();
              }}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <UserPlus size={16} color="#6b7280" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Save contact</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                onRemind();
              }}
              className="flex-row items-center px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700"
            >
              <Bell size={16} color="#d97706" />
              <Text className="ml-3 text-sm text-gray-700 dark:text-gray-300">Set reminder</Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </View>
  );
}
