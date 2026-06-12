import Constants from "expo-constants";
import * as Linking from "expo-linking";
import {
  Bell,
  ChevronRight,
  Clipboard,
  Clock,
  Database,
  Download,
  Globe,
  Heart,
  Megaphone,
  MessageCircle,
  MessageSquareText,
  Moon,
  Shield,
  Smartphone,
  Star,
  Sun,
  Trash2,
  Vibrate,
  Volume2,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Share, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import ConfirmSheet, { type ConfirmAction } from "../components/ConfirmSheet";
import CountryPickerSheet from "../components/Country/CountryPickerSheet";
import FrequencyPickerSheet from "../components/FrequencyPickerSheet";
import Divider from "../components/ui/Divider";
import PageHeader from "../components/ui/PageHeader";
import SectionGroup from "../components/ui/SectionGroup";
import SectionHeader from "../components/ui/SectionHeader";
import SettingsRow from "../components/ui/SettingsRow";
import { clearAllBroadcasts, clearAllRecent, clearAllReminders, clearAllTemplates } from "../db";
import { useIsDark } from "../hooks/useIsDark";
import { getCountryName, useAppStore } from "../store/useAppStore";

export default function SettingsPage() {
  const insets = useSafeAreaInsets();
  const isDark = useIsDark();
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const setCountryPickerOpen = useAppStore((s) => s.setCountryPickerOpen);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const clearAllRecentContacts = useAppStore((s) => s.clearAllRecentContacts);
  const clipboardDetection = useAppStore((s) => s.clipboardDetection);
  const toggleClipboard = useAppStore((s) => s.toggleClipboardDetection);
  const notificationSound = useAppStore((s) => s.notificationSound);
  const toggleSound = useAppStore((s) => s.toggleNotificationSound);
  const hapticFeedback = useAppStore((s) => s.hapticFeedback);
  const toggleHaptic = useAppStore((s) => s.toggleHapticFeedback);
  const backupFrequency = useAppStore((s) => s.backupFrequency);
  const setBackupFrequency = useAppStore((s) => s.setBackupFrequency);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [freqPickerOpen, setFreqPickerOpen] = useState(false);


  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <PageHeader title="Settings" />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Preferences ──────────────────────────────────────────── */}
        <SectionHeader title="Preferences" />
        <SectionGroup>
          <SettingsRow
            icon={<Globe size={18} color="#2563eb" />}
            label="Default country"
            subtitle={`${getCountryName(selectedCountry.country)} (${selectedCountry.code})`}
            onPress={() => setCountryPickerOpen(true)}
          />
          <Divider />
          <SettingsRow
            icon={<Clipboard size={18} color="#059669" />}
            label="Clipboard detection"
            subtitle="Auto-detect phone numbers from clipboard"
            right={
              <Switch
                value={clipboardDetection}
                onValueChange={toggleClipboard}
                trackColor={{ false: "#d1d5db", true: "#059669" }}
              />
            }
          />
        </SectionGroup>

        {/* ── Notifications ────────────────────────────────────────── */}
        <SectionHeader title="Notifications" />
        <SectionGroup>
          <SettingsRow
            icon={<Volume2 size={18} color="#d97706" />}
            label="Reminder sound"
            subtitle="Play sound for reminder notifications"
            right={
              <Switch
                value={notificationSound}
                onValueChange={toggleSound}
                trackColor={{ false: "#d1d5db", true: "#059669" }}
              />
            }
          />
        </SectionGroup>

        {/* ── Appearance ───────────────────────────────────────────── */}
        <SectionHeader title="Appearance" />
        <SectionGroup>
          <View className="px-5 py-4">
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                {isDark ? <Moon size={18} color="#6366f1" /> : <Sun size={18} color="#f59e0b" />}
              </View>
              <Text className="ml-3 flex-1 text-[15px] text-gray-900 dark:text-gray-100">
                Theme
              </Text>
            </View>
            <View className="mt-3 flex-row gap-2">
              {(
                [
                  { key: "light" as const, label: "Light" },
                  { key: "dark" as const, label: "Dark" },
                  { key: "system" as const, label: "System" },
                ] as const
              ).map(({ key, label }) => {
                const active = theme === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setTheme(key)}
                    style={({ pressed }) => [
                      active
                        ? { backgroundColor: "#10b981" }
                        : pressed
                          ? { backgroundColor: isDark ? "#374151" : "#e5e7eb" }
                          : { backgroundColor: isDark ? "#1f2937" : "#f3f4f6" },
                    ]}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
                  >
                    {key === "light" && <Sun size={16} color={active ? "#fff" : "#f59e0b"} />}
                    {key === "dark" && <Moon size={16} color={active ? "#fff" : "#6366f1"} />}
                    {key === "system" && (
                      <Smartphone size={16} color={active ? "#fff" : "#6b7280"} />
                    )}
                    <Text
                      className={`text-[13px] font-semibold ${
                        active ? "text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Divider />
          <SettingsRow
            icon={<Vibrate size={18} color="#6b7280" />}
            label="Haptic feedback"
            subtitle="Vibrate on actions"
            right={
              <Switch
                value={hapticFeedback}
                onValueChange={toggleHaptic}
                trackColor={{ false: "#d1d5db", true: "#059669" }}
              />
            }
          />
        </SectionGroup>

        {/* ── Data ─────────────────────────────────────────────────── */}
        <SectionHeader title="Data" />
        <SectionGroup>
          <SettingsRow
            icon={<Trash2 size={18} color="#ef4444" />}
            label="Clear recent contacts"
            subtitle="Remove all saved numbers"
            onPress={() =>
              setConfirmAction({
                title: "Clear recent contacts",
                description:
                  "This will permanently remove all saved numbers. This cannot be undone.",
                icon: <Trash2 size={28} color="#dc2626" />,
                onConfirm: () => {
                  clearAllRecent();
                  clearAllRecentContacts();
                },
              })
            }
          />
          <Divider />
          <SettingsRow
            icon={<MessageSquareText size={18} color="#ef4444" />}
            label="Clear all templates"
            subtitle="Remove all quick responses"
            onPress={() =>
              setConfirmAction({
                title: "Clear all templates",
                description:
                  "This will permanently remove all quick responses. This cannot be undone.",
                icon: <MessageSquareText size={28} color="#dc2626" />,
                onConfirm: () => clearAllTemplates(),
              })
            }
          />
          <Divider />
          <SettingsRow
            icon={<Bell size={18} color="#ef4444" />}
            label="Clear all reminders"
            subtitle="Remove all follow-up reminders"
            onPress={() =>
              setConfirmAction({
                title: "Clear all reminders",
                description:
                  "This will permanently remove all follow-up reminders. This cannot be undone.",
                icon: <Bell size={28} color="#dc2626" />,
                onConfirm: () => clearAllReminders(),
              })
            }
          />
          <Divider />
          <SettingsRow
            icon={<Megaphone size={18} color="#ef4444" />}
            label="Clear all broadcasts"
            subtitle="Remove all broadcast drafts"
            onPress={() =>
              setConfirmAction({
                title: "Clear all broadcasts",
                description:
                  "This will permanently remove all broadcast drafts and their contacts. This cannot be undone.",
                icon: <Megaphone size={28} color="#dc2626" />,
                onConfirm: () => clearAllBroadcasts(),
              })
            }
          />
        </SectionGroup>

        {/* ── Backup ────────────────────────────────────────────────── */}
        <SectionHeader title="Backup" />
        <SectionGroup>
          <SettingsRow
            icon={<Database size={18} color="#2563eb" />}
            label="Last backup"
            subtitle="Never — back up your data to keep it safe"
          />
          <Divider />
          <SettingsRow
            icon={<Clock size={18} color="#d97706" />}
            label="Backup frequency"
            subtitle={backupFrequency.charAt(0).toUpperCase() + backupFrequency.slice(1)}
            right={<ChevronRight size={16} color="#9ca3af" />}
            onPress={() => setFreqPickerOpen(true)}
          />
          <Divider />
          <SettingsRow
            icon={<Download size={18} color="#059669" />}
            label="Back up now"
            subtitle="Export your data to a file"
            onPress={() =>
              Toast.show({
                type: "info",
                text1: "Coming soon",
                text2: "Backup export will be available in a future update.",
                visibilityTime: 2500,
              })
            }
          />
        </SectionGroup>

        {/* ── Privacy ──────────────────────────────────────────────── */}
        <SectionHeader title="Privacy" />
        <SectionGroup>
          <View className="px-5 py-3.5">
            <View className="flex-row">
              <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Shield size={18} color="#059669" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] text-gray-900 dark:text-gray-100">
                  Your data stays on-device
                </Text>
                <Text className="text-[13px] leading-5 text-gray-600 dark:text-gray-500">
                  All contacts, messages, reminders, and tags are stored locally. Nothing leaves
                  your phone.
                </Text>
              </View>
            </View>
          </View>
        </SectionGroup>

        {/* ── Support ──────────────────────────────────────────────── */}
        <SectionHeader title="Support" />
        <SectionGroup>
          <SettingsRow
            icon={<Star size={18} color="#f59e0b" />}
            label="Rate Atomic IQ"
            subtitle="If you find this app useful"
            onPress={() =>
              Linking.openURL("https://play.google.com/store/apps/details?id=com.atomiciq.com")
            }
          />
          <Divider />
          <SettingsRow
            icon={<Heart size={18} color="#ef4444" />}
            label="Share with a friend"
            subtitle="Spread the word"
            onPress={() =>
              Share.share({
                message:
                  "Check out Atomic IQ — open WhatsApp chats without saving contacts! https://atomiciq.com",
              })
            }
          />
          <Divider />
          <SettingsRow
            icon={<MessageCircle size={18} color="#059669" />}
            label="Send feedback"
            subtitle="We'd love to hear from you"
            onPress={() =>
              Linking.openURL(
                "whatsapp://send?phone=254732887318&text=Hi%2C%20feedback%20about%20Atomic%20IQ...",
              )
            }
          />
        </SectionGroup>

        {/* ── About ────────────────────────────────────────────────── */}
        <SectionHeader title="About" />
        <SectionGroup>
          <SettingsRow
            icon={<Smartphone size={18} color="#059669" />}
            label="Atomic IQ"
            subtitle={`Version ${Constants.expoConfig?.version ?? "0.0.0"}`}
          />
        </SectionGroup>
      </ScrollView>
      <CountryPickerSheet />
      <ConfirmSheet action={confirmAction} onClose={() => setConfirmAction(null)} />
      <FrequencyPickerSheet
        visible={freqPickerOpen}
        selected={backupFrequency}
        onSelect={setBackupFrequency}
        onClose={() => setFreqPickerOpen(false)}
      />
    </View>
  );
}
