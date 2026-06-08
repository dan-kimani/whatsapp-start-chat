import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import { updateContactNote, updateContactTags } from "../../db";
import { useAppStore } from "../../store/useAppStore";
import ReminderSheet from "../Reminders/ReminderSheet";
import ContactItem, { type RecentContact } from "./ContactItem";
import NoteSheet from "./NoteSheet";

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
  const [noteTarget, setNoteTarget] = useState<RecentContact | null>(null);

  useEffect(() => {
    loadRecentContacts();
  }, [loadRecentContacts]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRecentContacts();
    setRefreshing(false);
  }, [loadRecentContacts]);

  const getContactName = (contact: RecentContact) =>
    contactNames[`${contact.countryCode}${contact.phoneNumber}`.replace(/\D/g, "")] ||
    contactNames[contact.phoneNumber];

  const addCustomTag = useAppStore((s) => s.addCustomTag);

  const handleSaveNote = (note: string, tags: string[]) => {
    if (noteTarget) {
      updateContactNote(noteTarget.phoneNumber, note || null);
      updateContactTags(noteTarget.phoneNumber, tags.length > 0 ? tags.join(",") : null);
      // Add tags to the shared pool so they're available across contacts & reminders
      for (const tag of tags) addCustomTag(tag);
      loadRecentContacts();
      Toast.show({ type: "success", text1: "Details saved", visibilityTime: 2000 });
    }
    setNoteTarget(null);
  };

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
            contactName={getContactName(contact)}
            onSelect={selectRecentContact}
            onDelete={() => deleteRecentContact(contact.phoneNumber)}
            onCall={() => openDialer(contact.countryCode, contact.phoneNumber)}
            onOpenWhatsApp={() => openWhatsApp(contact.countryCode, contact.phoneNumber)}
            onSaveContact={() => saveContact(contact.countryCode, contact.phoneNumber)}
            onRemind={() =>
              setReminderTarget({
                phoneNumber: contact.phoneNumber,
                countryCode: contact.countryCode,
                contactName: getContactName(contact) || undefined,
              })
            }
            onAddNote={() => setNoteTarget(contact)}
          />
        )}
      />

      <NoteSheet
        visible={noteTarget !== null}
        phoneNumber={noteTarget?.phoneNumber ?? ""}
        countryCode={noteTarget?.countryCode ?? ""}
        contactName={noteTarget ? getContactName(noteTarget) : undefined}
        initialNote={noteTarget?.notes ?? ""}
        initialTags={
          noteTarget?.tags
            ? noteTarget.tags
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean)
            : []
        }
        onClose={() => setNoteTarget(null)}
        onSave={handleSaveNote}
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
