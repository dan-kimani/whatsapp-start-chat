import { useEffect, useRef, useState } from "react";
import { Alert, AppState, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { Plus, X, Check, Circle, SendHorizontal, ArrowLeft, Trash2 } from "lucide-react-native";

import MessageEditor from "../../components/MessageEditor";
import TemplateChips from "../../components/TemplateChips";
import * as db from "../../db";
import { useAppStore, formatPhoneNumber } from "../../store/useAppStore";

interface Contact {
  id: number;
  broadcastId: number;
  phoneNumber: string;
  countryCode: string;
  sent: number;
}

export default function BroadcastDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const broadcastId = parseInt(id, 10);
  const selectedCountry = useAppStore((s) => s.selectedCountry);

  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newNumber, setNewNumber] = useState("");
  const [loaded, setLoaded] = useState(false);

  const insets = useSafeAreaInsets();
  const appState = useRef(AppState.currentState);

  const load = async () => {
    const b = await db.getBroadcast(broadcastId);
    if (!b) {
      router.back();
      return;
    }
    setMessage(b.message);
    const cs = await db.getBroadcastContacts(broadcastId);
    setContacts(cs);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, [broadcastId]);

  // Track app state to detect return from WhatsApp
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        load(); // Refresh checklist on return
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const saveMessage = (text: string) => {
    setMessage(text);
    db.updateBroadcastMessage(broadcastId, text);
  };

  const addContact = async () => {
    const digits = `${selectedCountry.code}${newNumber}`.replace(/\D/g, "");
    if (digits.length < 9) return;
    await db.addBroadcastContact(broadcastId, newNumber.replace(/\D/g, ""), selectedCountry.code);
    setNewNumber("");
    load();
  };

  const removeContact = async (contactId: number) => {
    await db.removeBroadcastContact(contactId);
    load();
  };

  const deleteBroadcast = () => {
    Alert.alert("Delete broadcast?", "This will remove the draft and all contacts.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { db.deleteBroadcast(broadcastId); router.back(); } },
    ]);
  };

  const sendToContact = async (contact: Contact) => {
    const digits = `${contact.countryCode}${contact.phoneNumber}`.replace(/\D/g, "");
    const msgParam = message.trim() ? `&text=${encodeURIComponent(message.trim())}` : "";
    Linking.openURL(`whatsapp://send?phone=+${digits}${msgParam}`);
    db.markBroadcastContactSent(contact.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    load();
  };

  const nextContact = contacts.find((c) => !c.sent);
  const sentCount = contacts.filter((c) => c.sent).length;
  const done = contacts.length > 0 && sentCount === contacts.length;

  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} className="text-gray-400 dark:text-gray-500" />
        </Pressable>
        <Text className="text-lg font-bold flex-1 text-center text-gray-900 dark:text-gray-100">
          Broadcast
        </Text>
        <Pressable onPress={deleteBroadcast} className="p-2">
          <Trash2 size={20} color="#ef4444" />
        </Pressable>
      </View>

      {contacts.length > 0 && (
        <View className="px-5 mb-2">
          <View className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <View className="h-full rounded-full bg-emerald-500" style={{ width: `${(sentCount / contacts.length) * 100}%` }} />
          </View>
          <Text className="text-xs mt-1 text-right text-gray-400 dark:text-gray-500">
            {sentCount}/{contacts.length} sent
          </Text>
        </View>
      )}

      <View className="px-5 mb-4">
        <TemplateChips onSelect={saveMessage} />
        <MessageEditor value={message} onChangeText={saveMessage} placeholder="Broadcast message..." />
      </View>

      <View className="px-5 mb-3 flex-row items-center gap-2">
        <Text className="text-base text-gray-400 dark:text-gray-500">
          {selectedCountry.code}
        </Text>
        <TextInput
          value={newNumber}
          onChangeText={setNewNumber}
          placeholder="712 345 678"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          className="flex-1 rounded-xl px-4 py-3 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          maxLength={20}
          onSubmitEditing={addContact}
          returnKeyType="done"
        />
        <Pressable onPress={addContact} className="bg-emerald-500 p-3 rounded-xl active:bg-emerald-600" disabled={newNumber.replace(/\D/g, "").length < 9}>
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={contacts}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        keyExtractor={(c) => String(c.id)}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-gray-400 dark:text-gray-500">Add contacts above to start</Text>
          </View>
        }
        renderItem={({ item: c }) => (
          <View className={`flex-row items-center rounded-xl p-4 mb-2 ${c.sent ? "bg-gray-50 dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}`}>
            {c.sent ? <Check size={20} color="#059669" /> : <Circle size={20} color="#9ca3af" />}
            <View className="flex-1 ml-3">
              <Text className={`text-base font-semibold ${c.sent ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
                {c.countryCode} {formatPhoneNumber(c.phoneNumber)}
              </Text>
            </View>
            {!c.sent && (
              <Pressable onPress={() => sendToContact(c)} className="bg-emerald-500 px-4 py-2 rounded-xl active:bg-emerald-600 flex-row items-center">
                <SendHorizontal size={14} color="#fff" />
                <Text className="text-sm font-medium text-white ml-1">Send</Text>
              </Pressable>
            )}
            <Pressable onPress={() => removeContact(c.id)} className="ml-2 p-2">
              <X size={16} color="#9ca3af" />
            </Pressable>
          </View>
        )}
      />

      {!done && nextContact && (
        <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white dark:bg-gray-950" style={{ paddingBottom: insets.bottom + 8 }}>
          <Pressable onPress={() => sendToContact(nextContact)} className="bg-emerald-500 rounded-xl py-4 items-center justify-center active:bg-emerald-600 flex-row">
            <SendHorizontal size={18} color="#fff" />
            <Text className="text-base font-semibold text-white ml-2">Send to next contact</Text>
          </Pressable>
        </View>
      )}

      {done && (
        <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white dark:bg-gray-950" style={{ paddingBottom: insets.bottom + 8 }}>
          <View className="bg-emerald-100 dark:bg-emerald-900/40 rounded-xl p-4 items-center">
            <Check size={24} color="#059669" />
            <Text className="text-base font-semibold text-emerald-700 dark:text-emerald-400 mt-1">All contacts sent</Text>
          </View>
        </View>
      )}
    </View>
  );
}
