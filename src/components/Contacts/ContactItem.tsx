import { formatDistanceToNow } from "date-fns";
import * as Linking from "expo-linking";
import { ChevronDown, Clock, MoreVertical, PencilLine, Tag } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import CountryFlag from "react-native-country-flag";
import { CountryCode } from "react-native-country-picker-modal";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { formatPhoneNumber, getCountryName } from "../../store/useAppStore";
import ContactMenu from "./ContactMenu";
import SwipeDeleteAction from "./SwipeDeleteAction";
import SwipeSmsAction from "./SwipeSmsAction";
import { useIsDark } from "../../hooks/useIsDark";
import { haptics, ImpactFeedbackStyle, NotificationFeedbackType } from "../../lib/haptics";

interface RecentContact {
  phoneNumber: string;
  countryCode: string;
  country: string;
  flag: string;
  usedAt: Date;
  notes?: string | null;
  tags?: string | null;
}

interface Props {
  contact: RecentContact;
  contactName?: string;
  onSelect: (c: RecentContact) => void;
  onDelete: () => void;
  onCall: () => void;
  onOpenWhatsApp: () => void;
  onSaveContact: () => void;
  onRemind: () => void;
  onAddNote: () => void;
}

export default function ContactItem({
  contact,
  onSelect,
  onDelete,
  onCall,
  onOpenWhatsApp,
  onSaveContact,
  onRemind,
  onAddNote,
  contactName,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });
  const isDark = useIsDark();
  const { height: screenHeight } = useWindowDimensions();

  const hasNote = !!contact.notes;

  const handleSwipeableOpen = (direction: "left" | "right") => {
    if (direction === "right") {
      const digits = `${contact.countryCode}${contact.phoneNumber}`.replace(/\D/g, "");
      Linking.openURL(`sms:+${digits}`);
      haptics.notificationAsync(NotificationFeedbackType.Success);
    } else {
      haptics.notificationAsync(NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  return (
    <View className="mb-3">
      <ReanimatedSwipeable
        friction={2}
        rightThreshold={40}
        overshootRight={false}
        renderRightActions={SwipeDeleteAction}
        renderLeftActions={SwipeSmsAction}
        onSwipeableOpen={handleSwipeableOpen}
        containerStyle={{ overflow: "visible" }}
      >
        <View className="overflow-hidden rounded-xl bg-white dark:bg-gray-800">
          <View className="flex-row items-center px-4 py-3">
            <Pressable onPress={() => onSelect(contact)} className="flex-1 flex-row items-center">
              <View className="mr-3 overflow-hidden rounded-md">
                <CountryFlag isoCode={contact.country as CountryCode} size={24} />
              </View>
              <View className="flex-1">
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
                <View className="mt-1.5 flex-row flex-wrap items-center gap-1">
                  {hasNote && (
                    <View className="flex-row items-center rounded-full bg-violet-100 px-1.5 py-0.5 dark:bg-violet-900/30">
                      <PencilLine size={9} color="#7c3aed" />
                      <Text
                        className="ml-0.5 max-w-40 text-[10px] font-semibold text-violet-700 dark:text-violet-400"
                        numberOfLines={1}
                      >
                        {contact.notes}
                      </Text>
                    </View>
                  )}
                  {contact.tags &&
                    contact.tags.split(",").map((tag) => {
                      const t = tag.trim();
                      if (!t) return null;
                      return (
                        <View
                          key={t}
                          className="flex-row items-center rounded-full bg-indigo-100 px-1.5 py-0.5 dark:bg-indigo-900/30"
                        >
                          <Tag size={9} color="#4f46e5" />
                          <Text className="ml-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
                            {t}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </View>
            </Pressable>

            {/* Chevron — opens note sheet */}
            <Pressable
              onPress={onAddNote}
              className="mr-1 rounded-full p-1.5 active:bg-gray-100 dark:active:bg-gray-700"
              hitSlop={6}
            >
              <ChevronDown size={16} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* ⋮ menu */}
            <Pressable
              onPress={(e) => {
                (e.target as any).measureInWindow(
                  (_x: number, y: number, _w: number, h: number) => {
                    const flipped = y + h + 200 > screenHeight;
                    setMenuPos({ top: flipped ? y - 200 - 4 : y + h + 4, right: 16 });
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
        </View>
      </ReanimatedSwipeable>

      <ContactMenu
        visible={menuOpen}
        position={menuPos}
        onClose={() => setMenuOpen(false)}
        onCall={onCall}
        onOpenWhatsApp={onOpenWhatsApp}
        onSaveContact={onSaveContact}
        onAddNote={onAddNote}
        onRemind={onRemind}
      />
    </View>
  );
}

export type { RecentContact };
