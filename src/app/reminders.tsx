import { router } from "expo-router";
import { ArrowLeft, Bell, CalendarDays, List } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CalendarView from "../components/Reminders/CalendarView";
import FilterBar from "../components/Reminders/FilterBar";
import ReminderItem from "../components/Reminders/ReminderItem";
import ReminderMenu from "../components/Reminders/ReminderMenu";
import ReminderSheet from "../components/Reminders/ReminderSheet";
import TagPickerModal from "../components/Reminders/TagPickerModal";
import { useAppStore } from "../store/useAppStore";
import { useRemindersPageStore } from "../store/useRemindersPageStore";
import { type ReminderEditData } from "../store/useReminderStore";

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RemindersPage() {
  const insets = useSafeAreaInsets();
  const store = useRemindersPageStore();
  const customTags = useAppStore((s) => s.customTags);
  const addCustomTag = useAppStore((s) => s.addCustomTag);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    store.load();
  }, [store.load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    store.load();
    setRefreshing(false);
  }, [store.load]);

  const now = Date.now();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayReminders = store.reminders.filter((r) => {
    if (r.myDay === 1) return true;
    const t = r.scheduledAt;
    return t >= todayStart.getTime() && t <= todayEnd.getTime();
  });
  const priorityReminders = store.reminders.filter((r) => r.priority === 1);

  const allTags: string[] = (() => {
    const tagSet = new Set<string>();
    for (const r of store.reminders) {
      if (r.tags) {
        r.tags.split(",").forEach((t) => {
          const trimmed = t.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    }
    for (const t of customTags) tagSet.add(t);
    return [...tagSet].sort();
  })();

  const tagCounts: Record<string, number> = {};
  for (const tag of allTags) {
    tagCounts[tag] = store.reminders.filter(
      (r) => r.tags && r.tags.split(",").some((t) => t.trim() === tag),
    ).length;
  }

  const filtered =
    store.filter === "all"
      ? store.reminders
      : store.filter === "today"
        ? todayReminders
        : store.filter === "priority"
          ? priorityReminders
          : store.reminders.filter((r) => {
              if (!r.tags) return false;
              return r.tags.split(",").some((t) => t.trim() === store.filter);
            });

  const upcoming = filtered.filter((r) => !r.completed && r.scheduledAt > now);
  const overdue = filtered.filter((r) => !r.completed && r.scheduledAt <= now);
  const done = filtered.filter((r) => r.completed);

  const dateMatches = (r: (typeof store.reminders)[0]) =>
    isoDate(new Date(r.scheduledAt)) === store.selectedDate;

  const selectedDateReminders = store.selectedDate ? store.reminders.filter(dateMatches) : [];
  const selectedDateActive = selectedDateReminders.filter((r) => !r.completed);
  const selectedDateDone = selectedDateReminders.filter((r) => r.completed);

  const menuReminder = useMemo(
    () => store.reminders.find((r) => r.id === store.menuReminderId) ?? null,
    [store.reminders, store.menuReminderId],
  );

  const handleDelete = (id: number) => {
    Alert.alert("Delete reminder?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => store.deleteReminder(id) },
    ]);
  };

  const handleDeleteTag = (tag: string) => {
    Alert.alert(`Delete tag "${tag}"?`, "This will remove it from all reminders.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => store.deleteTag(tag) },
    ]);
  };

  const renderListHeader = () => {
    if (filtered.length === 0) return null;
    return (
      <View>
        {overdue.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-bold text-red-500">Overdue</Text>
            {overdue.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                isOverdue
                onMenuOpen={(id, pos) => store.openMenu(id, "active", pos)}
              />
            ))}
          </View>
        )}
        {upcoming.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-bold text-gray-400 dark:text-gray-500">
              Upcoming
            </Text>
            {upcoming.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                isOverdue={false}
                onMenuOpen={(id, pos) => store.openMenu(id, "active", pos)}
              />
            ))}
          </View>
        )}
        {done.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-sm font-bold text-gray-400 dark:text-gray-500">
              Completed
            </Text>
            {done.map((r) => (
              <ReminderItem
                key={r.id}
                reminder={r}
                isOverdue={false}
                isCompleted
                onMenuOpen={(id, pos) => store.openMenu(id, "completed", pos)}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-950" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={22} color="#6b7280" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
          Reminders
        </Text>
        <Pressable
          onPress={() => store.setViewMode(store.viewMode === "list" ? "calendar" : "list")}
          className="p-2"
        >
          {store.viewMode === "calendar" ? (
            <List size={22} color="#6b7280" />
          ) : (
            <CalendarDays size={22} color="#6b7280" />
          )}
        </Pressable>
      </View>

      {store.viewMode === "list" && (
        <FilterBar
          filter={store.filter}
          todayCount={todayReminders.length}
          priorityCount={priorityReminders.length}
          allTags={allTags}
          onFilterChange={store.setFilter}
          onTagPickerOpen={store.openTagPicker}
          onCreateTag={(name) => addCustomTag(name)}
        />
      )}

      {store.viewMode === "list" ? (
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          data={[]}
          renderItem={() => null}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            filtered.length === 0 ? (
              <View className="items-center py-20">
                <Bell size={48} color="#9ca3af" />
                <Text className="mt-4 text-center text-base text-gray-400 dark:text-gray-500">
                  {store.reminders.length === 0
                    ? "No reminders yet\nTap the bell icon on a recent contact"
                    : "No reminders match this filter"}
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={renderListHeader()}
        />
      ) : (
        <View className="flex-1">
          <CalendarView
            reminders={store.reminders}
            selectedDate={store.selectedDate}
            onSelectDate={store.setSelectedDate}
          />
          {store.selectedDate ? (
            <FlatList
              data={[]}
              renderItem={() => null}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
              ListHeaderComponent={
                <View className="mt-2">
                  <Text className="mb-2 text-sm font-bold text-gray-400 dark:text-gray-500">
                    {new Date(store.selectedDate + "T00:00:00").toLocaleDateString("en", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  {selectedDateActive.map((r) => (
                    <ReminderItem
                      key={r.id}
                      reminder={r}
                      isOverdue={r.scheduledAt <= Date.now()}
                      onMenuOpen={(id, pos) => store.openMenu(id, "active", pos)}
                    />
                  ))}
                  {selectedDateDone.map((r) => (
                    <ReminderItem
                      key={r.id}
                      reminder={r}
                      isOverdue={false}
                      isCompleted
                      onMenuOpen={(id, pos) => store.openMenu(id, "completed", pos)}
                    />
                  ))}
                </View>
              }
              ListEmptyComponent={
                <Text className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No reminders for this date
                </Text>
              }
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <CalendarDays size={32} color="#9ca3af" />
              <Text className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Select a date to see reminders
              </Text>
            </View>
          )}
        </View>
      )}

      <TagPickerModal
        visible={store.tagPickerOpen}
        tags={allTags}
        tagCounts={tagCounts}
        insetsBottom={insets.bottom}
        onSelect={(tag) => {
          store.setFilter(tag);
          store.closeTagPicker();
        }}
        onDelete={(tag) => {
          store.closeTagPicker();
          handleDeleteTag(tag);
        }}
        onClose={store.closeTagPicker}
      />

      <ReminderMenu
        visible={menuReminder !== null}
        position={store.menuPos}
        mode={store.menuMode}
        onClose={store.closeMenu}
        onWhatsApp={() => menuReminder && store.openWhatsApp(menuReminder)}
        onEdit={() => {
          if (menuReminder) store.openEdit(menuReminder as ReminderEditData);
          store.closeMenu();
        }}
        onComplete={() => {
          if (menuReminder) store.completeReminder(menuReminder.id);
          store.closeMenu();
        }}
        onReopen={() => {
          if (menuReminder) store.reopenReminder(menuReminder.id);
          store.closeMenu();
        }}
        onDelete={() => {
          if (menuReminder) handleDelete(menuReminder.id);
          store.closeMenu();
        }}
      />

      <ReminderSheet
        visible={store.editVisible}
        phoneNumber={store.editReminder?.phoneNumber || ""}
        countryCode={store.editReminder?.countryCode || ""}
        editReminder={store.editReminder}
        onClose={store.closeEdit}
        onSaved={() => {
          store.load();
          store.closeEdit();
        }}
      />
    </View>
  );
}
