import * as Contacts from "expo-contacts/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import * as Linking from "expo-linking";
import { Platform } from "react-native";
import { Uniwind } from "uniwind";
import { FlagType, getAllCountries } from "react-native-country-picker-modal";
import type { Country as PickerCountry } from "react-native-country-picker-modal";
import { create } from "zustand";

import * as db from "../db";
import { haptics, ImpactFeedbackStyle, NotificationFeedbackType } from "../lib/haptics";

// Cache for countries data — preloaded on import, sorted once by calling code length
let countriesCache: PickerCountry[] | null = null;

export const loadCountries = async (): Promise<PickerCountry[]> => {
  if (countriesCache) return countriesCache;
  const raw = await getAllCountries(FlagType.EMOJI);
  countriesCache = [...raw].sort((a, b) => {
    const aCode = a.callingCode?.[0] || "";
    const bCode = b.callingCode?.[0] || "";
    return bCode.length - aCode.length;
  });
  return countriesCache;
};

// Warm the cache early so country detection in setPhoneNumber is synchronous
loadCountries();

function detectCountry(cleaned: string): PickerCountry | null {
  if (!countriesCache) return null;
  for (const country of countriesCache) {
    const code = country.callingCode?.[0];
    if (code && cleaned.startsWith(code)) return country;
  }
  return null;
}

function findCountryByCallingCode(callingCode: string): PickerCountry | undefined {
  if (!countriesCache) return undefined;
  const digits = callingCode.replace(/\D/g, "");
  return countriesCache.find((c) => c.callingCode?.[0] === digits);
}

export function getCountryName(cca2: string): string {
  if (!countriesCache) return cca2;
  const country = countriesCache.find((c) => c.cca2 === cca2);
  if (!country) return cca2;
  if (typeof country.name === "string") return country.name;
  return country.name.common || Object.values(country.name)[0] || cca2;
}

interface Country {
  code: string;
  country: string;
  flag: string;
}

interface RecentContactData {
  phoneNumber: string;
  countryCode: string;
  country: string;
  flag: string;
  usedAt: Date;
  notes?: string | null;
  tags?: string | null;
}

// Format phone number with spaces for better readability
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 0) return "";

  // Format in groups of 3-4 digits
  const parts: string[] = [];
  let remaining = cleaned;

  while (remaining.length > 0) {
    if (remaining.length <= 4) {
      parts.push(remaining);
      break;
    } else {
      parts.push(remaining.slice(0, 3));
      remaining = remaining.slice(3);
    }
  }

  return parts.join(" ");
};

interface AppStore {
  phoneNumber: string;
  rawPhoneNumber: string;
  selectedCountry: Country;
  selectedCountryCode: string;
  recentContacts: RecentContactData[];
  isCountryPickerOpen: boolean;
  messageText: string;
  contactNames: Record<string, string>;
  templates: { id: number; text: string }[];
  setPhoneNumber: (phone: string) => void;
  setSelectedCountry: (country: Country) => void;
  setCountryPickerOpen: (open: boolean) => void;
  setMessageText: (text: string) => void;
  loadTemplates: () => void;
  addTemplate: (text: string) => void;
  deleteTemplate: (id: number) => void;
  isValidNumber: () => boolean;
  startChat: () => Promise<void>;
  startCall: () => Promise<void>;
  openWhatsApp: (countryCode: string, phoneNumber: string) => void;
  openDialer: (countryCode: string, phoneNumber: string) => void;
  saveContact: (countryCode: string, phoneNumber: string) => Promise<void>;
  loadRecentContacts: () => Promise<void>;
  requestContactsPermission: () => Promise<void>;
  selectRecentContact: (contact: RecentContactData) => void;
  deleteRecentContact: (phoneNumber: string) => Promise<void>;
  clearAllRecentContacts: () => Promise<void>;
  loadMoreRecentContacts: () => void;
  customTags: string[];
  addCustomTag: (tag: string) => void;
  removeCustomTag: (tag: string) => void;
  clipboardDetection: boolean;
  toggleClipboardDetection: () => void;
  notificationSound: boolean;
  toggleNotificationSound: () => void;
  hapticFeedback: boolean;
  toggleHapticFeedback: () => void;
  theme: "system" | "light" | "dark";
  setTheme: (theme: "system" | "light" | "dark") => void;
  backupFrequency: "hourly" | "daily" | "weekly";
  setBackupFrequency: (freq: "hourly" | "daily" | "weekly") => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  phoneNumber: "",
  rawPhoneNumber: "",
  selectedCountry: (() => {
    try {
      const raw = db.getSetting("selectedCountry");
      if (raw) return JSON.parse(raw) as Country;
    } catch { /* fall through */ }
    return { code: "+254", country: "KE", flag: "🇰🇪" };
  })(),
  selectedCountryCode: (() => {
    try {
      const raw = db.getSetting("selectedCountry");
      if (raw) return (JSON.parse(raw) as Country).code;
    } catch { /* fall through */ }
    return "+254";
  })(),
  isCountryPickerOpen: false,
  messageText: "",
  contactNames: {},
  templates: [],
  recentContacts: [],

  // Lazy-loaded from DB on first access (migration may not have run at import time)
  customTags: (() => {
    try {
      return db.getCustomTags();
    } catch {
      return [];
    }
  })(),
  addCustomTag: (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    set((s) => {
      if (s.customTags.includes(trimmed)) return s;
      db.addCustomTagToDb(trimmed);
      return { customTags: [...s.customTags, trimmed].sort() };
    });
  },
  removeCustomTag: (tag) => {
    db.removeCustomTagFromDb(tag);
    set((s) => ({ customTags: s.customTags.filter((t) => t !== tag) }));
  },

  clipboardDetection: (() => {
    try {
      const raw = db.getSetting("clipboardDetection");
      if (raw !== undefined) return raw === "1";
    } catch { /* fall through */ }
    return true;
  })(),
  toggleClipboardDetection: () =>
    set((s) => {
      const next = !s.clipboardDetection;
      db.setSetting("clipboardDetection", next ? "1" : "0");
      return { clipboardDetection: next };
    }),

  notificationSound: (() => {
    try {
      const raw = db.getSetting("notificationSound");
      if (raw !== undefined) return raw === "1";
    } catch { /* fall through */ }
    return true;
  })(),
  toggleNotificationSound: () =>
    set((s) => {
      const next = !s.notificationSound;
      db.setSetting("notificationSound", next ? "1" : "0");
      return { notificationSound: next };
    }),

  theme: (() => {
    try {
      const raw = db.getSetting("theme");
      if (raw === "light" || raw === "dark") return raw;
    } catch { /* fall through */ }
    return "system";
  })(),
  setTheme: (theme) => {
    set({ theme });
    Uniwind.setTheme(theme);
    db.setSetting("theme", theme);
  },

  backupFrequency: (() => {
    try {
      const raw = db.getSetting("backupFrequency");
      if (raw === "hourly" || raw === "daily" || raw === "weekly") return raw;
    } catch { /* fall through */ }
    return "daily";
  })(),
  setBackupFrequency: (freq) => {
    db.setSetting("backupFrequency", freq);
    set({ backupFrequency: freq });
  },

  hapticFeedback: (() => {
    try {
      const raw = db.getSetting("hapticFeedback");
      if (raw !== undefined) return raw === "1";
    } catch { /* fall through */ }
    return true;
  })(),
  toggleHapticFeedback: () =>
    set((s) => {
      const next = !s.hapticFeedback;
      db.setSetting("hapticFeedback", next ? "1" : "0");
      return { hapticFeedback: next };
    }),

  setPhoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    const looksInternational = phone.startsWith("+");

    if (cleaned.length > 0 && looksInternational) {
      // Try synchronous detection first (cache is preloaded on import)
      const matched = detectCountry(cleaned);
      if (matched) {
        const code = matched.callingCode?.[0] ?? "";
        const phoneWithoutCode = cleaned.substring(code.length);
        const formatted = formatPhoneNumber(phoneWithoutCode);
        haptics.impactAsync(ImpactFeedbackStyle.Light);
        set({
          selectedCountry: { code: `+${code}`, country: matched.cca2, flag: matched.flag || "" },
          selectedCountryCode: `+${code}`,
          phoneNumber: formatted,
          rawPhoneNumber: phoneWithoutCode,
        });
        return;
      }

      // Cache miss — fall back to async, but still show the number immediately
      const formatted = formatPhoneNumber(cleaned);
      set({ phoneNumber: formatted, rawPhoneNumber: cleaned });

      loadCountries().then(() => {
        const currentRaw = get().rawPhoneNumber;
        if (currentRaw !== cleaned) return;
        const retry = detectCountry(cleaned);
        if (retry) {
          const code = retry.callingCode?.[0] ?? "";
          const phoneWithoutCode = cleaned.substring(code.length);
          haptics.impactAsync(ImpactFeedbackStyle.Light);
          set({
            selectedCountry: { code: `+${code}`, country: retry.cca2, flag: retry.flag || "" },
            selectedCountryCode: `+${code}`,
            phoneNumber: formatPhoneNumber(phoneWithoutCode),
            rawPhoneNumber: phoneWithoutCode,
          });
        }
      });
      return;
    }

    // Plain local number — no country code detection needed
    const formatted = formatPhoneNumber(cleaned);
    set({ phoneNumber: formatted, rawPhoneNumber: cleaned });
  },

  setCountryPickerOpen: (open) => set({ isCountryPickerOpen: open }),
  setMessageText: (text) => set({ messageText: text }),
  loadTemplates: () => {
    const templates = db.getTemplates();
    set({ templates });
  },
  addTemplate: (text) => {
    db.addTemplate(text);
    const templates = db.getTemplates();
    set({ templates });
  },
  deleteTemplate: (id) => {
    db.deleteTemplate(id);
    const templates = db.getTemplates();
    set({ templates });
  },

  setSelectedCountry: (country) => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    db.setSetting("selectedCountry", JSON.stringify(country));
    set({ selectedCountry: country, selectedCountryCode: country.code });
  },

  isValidNumber: () => get().rawPhoneNumber.trim().length >= 9,

  startChat: async () => {
    const { rawPhoneNumber, selectedCountry } = get();
    if (!rawPhoneNumber.trim()) return;

    // Haptic feedback on button press
    await haptics.impactAsync(ImpactFeedbackStyle.Medium);

    const digits = `${selectedCountry.code}${rawPhoneNumber}`.replace(/\D/g, "");
    const fullNumber = `+${digits}`;
    const message = (get().messageText ?? "").trim();
    const whatsappUrl = `whatsapp://send?phone=${fullNumber}${message ? `&text=${encodeURIComponent(message)}` : ""}`;

    // Save to recent contacts (fire-and-forget — don't block WhatsApp)
    db.saveContact(
      rawPhoneNumber,
      selectedCountry.code,
      selectedCountry.country,
      selectedCountry.flag,
    )
      .then(() => get().loadRecentContacts())
      .catch(() => {});

    // Open WhatsApp - Android will show chooser if both apps are installed
    Linking.openURL(whatsappUrl);
    haptics.notificationAsync(NotificationFeedbackType.Success);
  },

  startCall: async () => {
    const { rawPhoneNumber, selectedCountry } = get();
    if (!rawPhoneNumber.trim()) return;

    await haptics.impactAsync(ImpactFeedbackStyle.Medium);

    const digits = `${selectedCountry.code}${rawPhoneNumber}`.replace(/\D/g, "");
    const fullNumber = `+${digits}`;

    // Save to recent contacts (fire-and-forget — don't block dialer)
    db.saveContact(
      rawPhoneNumber,
      selectedCountry.code,
      selectedCountry.country,
      selectedCountry.flag,
    )
      .then(() => get().loadRecentContacts())
      .catch(() => {});

    Linking.openURL(`tel:${fullNumber}`);
    haptics.notificationAsync(NotificationFeedbackType.Success);
  },

  openDialer: (countryCode, phoneNumber) => {
    const digits = `${countryCode}${phoneNumber}`.replace(/\D/g, "");
    const country = findCountryByCallingCode(countryCode);
    db.saveContact(phoneNumber, countryCode, country?.cca2 ?? "", country?.flag ?? "").catch(
      () => {},
    );
    Linking.openURL(`tel:+${digits}`);
    haptics.notificationAsync(NotificationFeedbackType.Success);
  },

  openWhatsApp: (countryCode, phoneNumber) => {
    const digits = `${countryCode}${phoneNumber}`.replace(/\D/g, "");
    const country = findCountryByCallingCode(countryCode);
    db.saveContact(phoneNumber, countryCode, country?.cca2 ?? "", country?.flag ?? "").catch(
      () => {},
    );
    Linking.openURL(`whatsapp://send?phone=+${digits}`);
    haptics.notificationAsync(NotificationFeedbackType.Success);
  },

  saveContact: async (countryCode, phoneNumber) => {
    const digits = `${countryCode}${phoneNumber}`.replace(/\D/g, "");
    const fullNumber = `+${digits}`;

    if (Platform.OS === "android") {
      try {
        await IntentLauncher.startActivityAsync("android.intent.action.INSERT", {
          type: "vnd.android.cursor.dir/raw_contact",
          extra: { phone: fullNumber },
        });
        haptics.notificationAsync(NotificationFeedbackType.Success);
      } catch {
        // User cancelled
      }
    } else {
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== "granted") return;
        await Contacts.presentFormAsync(null, {
          contactType: "person",
          name: "",
          phoneNumbers: [{ number: fullNumber, label: "mobile", id: "" }],
        } as any);
        haptics.notificationAsync(NotificationFeedbackType.Success);
      } catch {
        // User cancelled
      }
    }
  },

  loadRecentContacts: async () => {
    try {
      const contacts = db.getRecentContacts(20, 0);

      const recentContactsData: RecentContactData[] = contacts.map((contact) => {
        let country = contact.country;
        let flag = contact.flag;
        if (!country || !flag) {
          const found = findCountryByCallingCode(contact.countryCode);
          if (found) {
            country = country || found.cca2;
            flag = flag || found.flag || "";
          }
        }
        return {
          phoneNumber: contact.phoneNumber,
          countryCode: contact.countryCode,
          country,
          flag,
          usedAt: new Date(contact.usedAt),
          notes: contact.notes,
          tags: contact.tags,
        };
      });

      // Resolve device contact names (uses whatever permission state exists)
      let contactNames: Record<string, string> = {};
      try {
        const perm = await Contacts.getPermissionsAsync();
        if (perm.status === "granted") {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
          });
          for (const c of data) {
            const name = c.name;
            if (!name || !c.phoneNumbers) continue;
            for (const pn of c.phoneNumbers) {
              if (pn.number) {
                const digits = pn.number.replace(/\D/g, "");
                if (digits.length >= 7) contactNames[digits] = name;
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load contacts from device:", err);
      }

      set({ recentContacts: recentContactsData, contactNames });
    } catch (error) {
      console.error("Failed to load recent contacts:", error);
      set({ recentContacts: [], contactNames: {} });
    }
  },

  loadMoreRecentContacts: () => {
    const current = get().recentContacts;
    const contacts = db.getRecentContacts(20, current.length);
    if (contacts.length === 0) return;

    const newContacts: RecentContactData[] = contacts.map((contact) => {
      let country = contact.country;
      let flag = contact.flag;
      if (!country || !flag) {
        const found = findCountryByCallingCode(contact.countryCode);
        if (found) {
          country = country || found.cca2;
          flag = flag || found.flag || "";
        }
      }
      return {
        phoneNumber: contact.phoneNumber,
        countryCode: contact.countryCode,
        country,
        flag,
        usedAt: new Date(contact.usedAt),
        notes: contact.notes,
        tags: contact.tags,
      };
    });

    set({ recentContacts: [...current, ...newContacts] });
  },

  selectRecentContact: (contact) => {
    haptics.impactAsync(ImpactFeedbackStyle.Light);
    const country = {
      code: contact.countryCode,
      country: contact.country,
      flag: contact.flag,
    };
    set({
      selectedCountry: country,
      selectedCountryCode: contact.countryCode,
      rawPhoneNumber: contact.phoneNumber,
      phoneNumber: formatPhoneNumber(contact.phoneNumber),
    });
  },

  deleteRecentContact: async (phoneNumber) => {
    try {
      await haptics.impactAsync(ImpactFeedbackStyle.Medium);
      await db.deleteContact(phoneNumber);
      get().loadRecentContacts();
    } catch (error) {
      console.error("Failed to delete recent contact:", error);
    }
  },

  requestContactsPermission: async () => {
    try {
      await Contacts.requestPermissionsAsync();
    } catch {
      // Ignore — loadRecentContacts will work with whatever state exists
    }
  },

  clearAllRecentContacts: async () => {
    try {
      db.clearAllRecent();
      set({ recentContacts: [] });
      haptics.notificationAsync(NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to clear recent contacts:", error);
    }
  },
}));

// Restore persisted theme immediately on app startup (before first render)
Uniwind.setTheme(useAppStore.getState().theme);

export type { Country };
