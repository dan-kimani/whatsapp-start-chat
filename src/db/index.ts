import { eq, desc, and, asc, count, sql } from "drizzle-orm";

import { db } from "./client";
import {
  recentContacts,
  broadcasts,
  broadcastContacts,
  messageTemplates,
  reminders,
} from "./schema";

// -- Recent Contacts --

export async function saveContact(
  phoneNumber: string,
  countryCode: string,
  country: string,
  flag: string,
) {
  const usedAt = Date.now();
  const existing = db
    .select()
    .from(recentContacts)
    .where(eq(recentContacts.phoneNumber, phoneNumber))
    .get();

  if (existing) {
    db.update(recentContacts)
      .set({ usedAt, countryCode, country, flag })
      .where(eq(recentContacts.id, existing.id))
      .run();
  } else {
    db.insert(recentContacts).values({ phoneNumber, countryCode, country, flag, usedAt }).run();
  }
}

export function getRecentContacts(limit = 20, offset = 0) {
  return db
    .select()
    .from(recentContacts)
    .orderBy(desc(recentContacts.usedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getRecentContactsCount() {
  return db.select({ c: count() }).from(recentContacts).get()?.c ?? 0;
}

export function deleteContact(phoneNumber: string) {
  db.delete(recentContacts).where(eq(recentContacts.phoneNumber, phoneNumber)).run();
}

export function clearAllRecent() {
  db.delete(recentContacts).run();
}

// -- Broadcasts --

export function createBroadcast(message: string) {
  const r = db.insert(broadcasts).values({ message, createdAt: Date.now() }).run();
  return r.lastInsertRowId;
}

export function getBroadcasts() {
  return db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).all();
}

export function getBroadcast(id: number) {
  return db.select().from(broadcasts).where(eq(broadcasts.id, id)).get();
}

export function deleteBroadcast(id: number) {
  db.delete(broadcastContacts).where(eq(broadcastContacts.broadcastId, id)).run();
  db.delete(broadcasts).where(eq(broadcasts.id, id)).run();
}

export function updateBroadcastMessage(id: number, message: string) {
  db.update(broadcasts).set({ message }).where(eq(broadcasts.id, id)).run();
}

export function getBroadcastContacts(broadcastId: number) {
  return db
    .select()
    .from(broadcastContacts)
    .where(eq(broadcastContacts.broadcastId, broadcastId))
    .orderBy(asc(broadcastContacts.id))
    .all();
}

export function addBroadcastContact(broadcastId: number, phoneNumber: string, countryCode: string) {
  db.insert(broadcastContacts).values({ broadcastId, phoneNumber, countryCode }).run();
}

export function removeBroadcastContact(contactId: number) {
  db.delete(broadcastContacts).where(eq(broadcastContacts.id, contactId)).run();
}

export function markBroadcastContactSent(contactId: number) {
  db.update(broadcastContacts).set({ sent: 1 }).where(eq(broadcastContacts.id, contactId)).run();
}

export function getBroadcastProgress(broadcastId: number) {
  const total =
    db
      .select({ c: count() })
      .from(broadcastContacts)
      .where(eq(broadcastContacts.broadcastId, broadcastId))
      .get()?.c ?? 0;
  const sent =
    db
      .select({ c: count() })
      .from(broadcastContacts)
      .where(and(eq(broadcastContacts.broadcastId, broadcastId), eq(broadcastContacts.sent, 1)))
      .get()?.c ?? 0;
  return { total, sent };
}

// -- Message Templates --

export function getTemplates() {
  return db
    .select({ id: messageTemplates.id, text: messageTemplates.text })
    .from(messageTemplates)
    .orderBy(asc(messageTemplates.sortOrder))
    .all();
}

export function addTemplate(text: string) {
  db.insert(messageTemplates)
    .values({
      text,
      sortOrder: sql`(SELECT COALESCE(MAX(sort_order), 0) + 1 FROM message_templates)`,
    })
    .run();
}

export function deleteTemplate(id: number) {
  db.delete(messageTemplates).where(eq(messageTemplates.id, id)).run();
}

// -- Reminders --

export function createReminder(
  phoneNumber: string,
  countryCode: string,
  message: string,
  scheduledAt: number,
  priority = 0,
  myDay = 0,
  tags: string | null = null,
) {
  const r = db
    .insert(reminders)
    .values({
      phoneNumber,
      countryCode,
      message,
      scheduledAt,
      priority,
      myDay,
      tags,
      createdAt: Date.now(),
    })
    .run();
  return r.lastInsertRowId;
}

export function getAllTags(): string[] {
  const rows = db.select({ tags: reminders.tags }).from(reminders).all();
  const tagSet = new Set<string>();
  for (const row of rows) {
    if (row.tags) {
      row.tags.split(",").forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    }
  }
  return [...tagSet].sort();
}

export function updateReminderNotification(reminderId: number, notificationId: string) {
  db.update(reminders).set({ notificationId }).where(eq(reminders.id, reminderId)).run();
}

export function completeReminder(reminderId: number) {
  db.update(reminders).set({ completed: 1 }).where(eq(reminders.id, reminderId)).run();
}

export function getAllReminders() {
  return db.select().from(reminders).orderBy(asc(reminders.scheduledAt)).all();
}

export function updateReminder(
  id: number,
  updates: {
    message?: string;
    scheduledAt?: number;
    completed?: number;
    priority?: number;
    myDay?: number;
    tags?: string | null;
  },
) {
  db.update(reminders).set(updates).where(eq(reminders.id, id)).run();
}

export function deleteReminderById(id: number) {
  db.delete(reminders).where(eq(reminders.id, id)).run();
}

export function getPendingReminders() {
  return db
    .select({
      id: reminders.id,
      phoneNumber: reminders.phoneNumber,
      countryCode: reminders.countryCode,
      message: reminders.message,
      scheduledAt: reminders.scheduledAt,
    })
    .from(reminders)
    .where(and(eq(reminders.completed, 0), sql`${reminders.scheduledAt} <= ${Date.now()}`))
    .orderBy(asc(reminders.scheduledAt))
    .all();
}
