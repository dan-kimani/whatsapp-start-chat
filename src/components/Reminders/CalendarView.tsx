import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface Reminder {
  id: number;
  scheduledAt: number;
  completed: number;
}

interface Props {
  reminders: Reminder[];
  selectedDate: string | null; // ISO "2026-06-09"
  onSelectDate: (date: string | null) => void;
}

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function sameMonth(y1: number, m1: number, y2: number, m2: number) {
  return y1 === y2 && m1 === m2;
}

export default function CalendarView({ reminders, selectedDate, onSelectDate }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const isCurrentMonth = sameMonth(year, month, today.getFullYear(), today.getMonth());

  const goToPrevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

  const reminderDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of reminders) {
      const d = new Date(r.scheduledAt);
      set.add(isoDate(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    return set;
  }, [reminders]);

  const completedDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of reminders) {
      if (r.completed) {
        const d = new Date(r.scheduledAt);
        set.add(isoDate(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    }
    return set;
  }, [reminders]);

  const overdueDates = useMemo(() => {
    const now = Date.now();
    const set = new Set<string>();
    for (const r of reminders) {
      if (!r.completed && r.scheduledAt <= now) {
        const d = new Date(r.scheduledAt);
        set.add(isoDate(d.getFullYear(), d.getMonth(), d.getDate()));
      }
    }
    return set;
  }, [reminders]);

  const days = getCalendarDays(year, month);
  const monthLabel = new Date(year, month).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

  const hasReminder = (day: number) => {
    const date = isoDate(year, month, day);
    return reminderDates.has(date);
  };

  return (
    <View className="px-4">
      {/* Month nav */}
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={goToPrevMonth}
          className="rounded-lg p-1.5 active:bg-gray-100 dark:active:bg-gray-800"
        >
          <ChevronLeft size={20} color="#6b7280" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-bold text-gray-900 dark:text-gray-100">{monthLabel}</Text>
          {!isCurrentMonth && (
            <Pressable
              onPress={() => {
                setYear(today.getFullYear());
                setMonth(today.getMonth());
              }}
              className="rounded-full bg-indigo-100 px-2 py-0.5 dark:bg-indigo-900/40"
            >
              <Text className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Today
              </Text>
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={goToNextMonth}
          className="rounded-lg p-1.5 active:bg-gray-100 dark:active:bg-gray-800"
        >
          <ChevronRight size={20} color="#6b7280" />
        </Pressable>
      </View>

      {/* Day names */}
      <View className="mb-1 flex-row">
        {DAY_NAMES.map((name) => (
          <View key={name} className="flex-1 items-center py-1">
            <Text className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View className="flex-row flex-wrap">
        {days.map((day, i) => {
          // oxlint-disable react/no-array-index-key
          if (day === null) return <View key={`e-${i}`} className="h-10 w-[14.28%]" />;

          const date = isoDate(year, month, day);
          const isToday = date === todayIso;
          const isSelected = date === selectedDate;
          const has = hasReminder(day);
          const isOverdue = overdueDates.has(date);
          const isDone = has && completedDates.has(date) && !overdueDates.has(date);

          let dotColor = "#6366f1";
          if (isOverdue) dotColor = "#ef4444";
          else if (isDone) dotColor = "#059669";

          return (
            <Pressable
              key={date}
              onPress={() => onSelectDate(isSelected ? null : date)}
              className={`h-10 w-[14.28%] items-center justify-center rounded-lg ${
                isSelected ? "bg-indigo-500" : isToday ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected
                    ? "text-white"
                    : isToday
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {day}
              </Text>
              {has && (
                <View
                  className="mt-0.5 h-1 w-1 rounded-full"
                  style={{ backgroundColor: isSelected ? "#fff" : dotColor }}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Legend */}
      <View className="mt-3 flex-row items-center justify-center gap-4">
        <View className="flex-row items-center gap-1">
          <View className="h-2 w-2 rounded-full bg-indigo-500" />
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">Upcoming</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="h-2 w-2 rounded-full bg-red-500" />
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">Overdue</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="h-2 w-2 rounded-full bg-emerald-500" />
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">Done</Text>
        </View>
      </View>
    </View>
  );
}
