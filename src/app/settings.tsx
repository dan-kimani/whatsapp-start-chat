import * as Linking from "expo-linking";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Clipboard,
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
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clearAllBroadcasts, clearAllRecent, clearAllReminders, clearAllTemplates } from "../db";
import { useAppStore } from "../store/useAppStore";

export default function SettingsPage() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const clearAllRecentContacts = useAppStore((s) => s.clearAllRecentContacts);
  const clipboardDetection = useAppStore((s) => s.clipboardDetection);
  const toggleClipboard = useAppStore((s) => s.toggleClipboardDetection);
  const notificationSound = useAppStore((s) => s.notificationSound);
  const toggleSound = useAppStore((s) => s.toggleNotificationSound);

  const handleClear = (label: string, action: () => void, reload?: () => void) => {
    Alert.alert(`Clear ${label.toLowerCase()}?`, `This will remove all ${label.toLowerCase()}.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          action();
          reload?.();
        },
      },
    ]);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="mt-6 mb-2 ml-5 text-xs font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">
      {title}
    </Text>
  );

  const Row = ({
    icon,
    label,
    subtitle,
    onPress,
    right,
  }: {
    icon: React.ReactNode;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      className="flex-row items-center px-5 py-3.5 active:bg-gray-50 dark:active:bg-gray-800"
    >
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        {icon}
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] text-gray-900 dark:text-gray-100">{label}</Text>
        {subtitle && (
          <Text className="text-[13px] text-gray-400 dark:text-gray-500">{subtitle}</Text>
        )}
      </View>
      {right || (onPress && <ChevronRight size={16} color="#9ca3af" />)}
    </Pressable>
  );

  const Divider = () => <View className="ml-16 h-px bg-gray-100 dark:bg-gray-800" />;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color="#6b7280" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          Settings
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Preferences ──────────────────────────────────────────── */}
        <SectionHeader title="Preferences" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <Row
            icon={<Globe size={18} color="#2563eb" />}
            label="Default country"
            subtitle="Kenya (+254)"
            onPress={() => Alert.alert("Coming soon", "Country picker coming soon.")}
          />
          <Divider />
          <Row
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
        </View>

        {/* ── Notifications ────────────────────────────────────────── */}
        <SectionHeader title="Notifications" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <Row
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
        </View>

        {/* ── Appearance ───────────────────────────────────────────── */}
        <SectionHeader title="Appearance" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <Row
            icon={isDark ? <Moon size={18} color="#6366f1" /> : <Sun size={18} color="#f59e0b" />}
            label="Theme"
            subtitle={isDark ? "Dark" : "Light"}
            onPress={() =>
              Alert.alert("Theme", "Follows your device system settings automatically.")
            }
          />
          <Divider />
          <Row
            icon={<Vibrate size={18} color="#6b7280" />}
            label="Haptic feedback"
            subtitle="Vibrate on actions"
            right={
              <Switch value={true} disabled trackColor={{ false: "#d1d5db", true: "#059669" }} />
            }
          />
        </View>

        {/* ── Data ─────────────────────────────────────────────────── */}
        <SectionHeader title="Data" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <Row
            icon={<Trash2 size={18} color="#ef4444" />}
            label="Clear recent contacts"
            subtitle="Remove all saved numbers"
            onPress={() => handleClear("recent contacts", clearAllRecent, clearAllRecentContacts)}
          />
          <Divider />
          <Row
            icon={<MessageSquareText size={18} color="#ef4444" />}
            label="Clear all templates"
            subtitle="Remove all quick responses"
            onPress={() => handleClear("templates", clearAllTemplates)}
          />
          <Divider />
          <Row
            icon={<Bell size={18} color="#ef4444" />}
            label="Clear all reminders"
            subtitle="Remove all follow-up reminders"
            onPress={() => handleClear("reminders", clearAllReminders)}
          />
          <Divider />
          <Row
            icon={<Megaphone size={18} color="#ef4444" />}
            label="Clear all broadcasts"
            subtitle="Remove all broadcast drafts"
            onPress={() => handleClear("broadcasts", clearAllBroadcasts)}
          />
        </View>

        {/* ── Privacy ──────────────────────────────────────────────── */}
        <SectionHeader title="Privacy" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <View className="px-5 py-3.5">
            <View className="flex-row">
              <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Shield size={18} color="#059669" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[15px] text-gray-900 dark:text-gray-100">
                  Your data stays on-device
                </Text>
                <Text className="text-[13px] leading-5 text-gray-400 dark:text-gray-500">
                  All contacts, messages, reminders, and tags are stored locally in SQLite. Nothing
                  leaves your phone.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Support ──────────────────────────────────────────────── */}
        <SectionHeader title="Support" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <Row
            icon={<Star size={18} color="#f59e0b" />}
            label="Rate Atomic IQ"
            subtitle="If you find this app useful"
            onPress={() =>
              Linking.openURL("https://play.google.com/store/apps/details?id=com.atomiciq.com")
            }
          />
          <Divider />
          <Row
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
          <Row
            icon={<MessageCircle size={18} color="#059669" />}
            label="Send feedback"
            subtitle="We'd love to hear from you"
            onPress={() =>
              Linking.openURL(
                "whatsapp://send?phone=+254712345678&text=Hi%2C%20feedback%20about%20Atomic%20IQ...",
              )
            }
          />
        </View>

        {/* ── About ────────────────────────────────────────────────── */}
        <SectionHeader title="About" />
        <View className="mx-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
          <Row
            icon={<Smartphone size={18} color="#059669" />}
            label="Atomic IQ"
            subtitle="Version 0.0.3"
          />
        </View>
      </ScrollView>
    </View>
  );
}
