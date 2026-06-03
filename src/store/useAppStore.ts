import { create } from "zustand";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import { database } from "../db";
import { getAllCountries, FlagType } from "react-native-country-picker-modal";
import type { Country as PickerCountry } from "react-native-country-picker-modal";

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
}

// Format phone number with spaces for better readability
const formatPhoneNumber = (value: string): string => {
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
  setPhoneNumber: (phone: string) => void;
  setSelectedCountry: (country: Country) => void;
  setCountryPickerOpen: (open: boolean) => void;
  isValidNumber: () => boolean;
  startChat: () => Promise<void>;
  loadRecentContacts: () => Promise<void>;
  selectRecentContact: (contact: RecentContactData) => void;
  deleteRecentContact: (phoneNumber: string) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  phoneNumber: "",
  rawPhoneNumber: "",
  selectedCountry: { code: "+254", country: "KE", flag: "🇰🇪" },
  selectedCountryCode: "+254",
  isCountryPickerOpen: false,
  recentContacts: [],

  setPhoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    const looksInternational = phone.startsWith("+") || cleaned.length > 10;

    if (cleaned.length > 0 && looksInternational) {
      // Try synchronous detection first (cache is preloaded on import)
      const matched = detectCountry(cleaned);
      if (matched) {
        const code = matched.callingCode?.[0] ?? "";
        const phoneWithoutCode = cleaned.substring(code.length);
        const formatted = formatPhoneNumber(phoneWithoutCode);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  setSelectedCountry: (country) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set({ selectedCountry: country, selectedCountryCode: country.code });
  },

  isValidNumber: () => get().rawPhoneNumber.trim().length >= 9,

  startChat: async () => {
    const { rawPhoneNumber, selectedCountry } = get();
    if (!rawPhoneNumber.trim()) return;

    // Haptic feedback on button press
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const fullNumber = `${selectedCountry.code}${rawPhoneNumber}`.replace(/\D/g, "");
    const whatsappUrl = `whatsapp://send?phone=${fullNumber}`;

    // Save to recent contacts
    try {
      await database.saveContact(rawPhoneNumber, selectedCountry.code, selectedCountry.country, selectedCountry.flag);
      get().loadRecentContacts();
    } catch (error) {
      console.error("Failed to save recent contact:", error);
    }

    // Open WhatsApp - Android will show chooser if both apps are installed
    Linking.openURL(whatsappUrl);
  },

  loadRecentContacts: async () => {
    try {
      const contacts = await database.getRecentContacts(5);

      const recentContactsData: RecentContactData[] = contacts.map((contact) => ({
        phoneNumber: contact.phone_number,
        countryCode: contact.country_code,
        country: contact.country,
        flag: contact.flag,
        usedAt: new Date(contact.used_at),
      }));

      set({ recentContacts: recentContactsData });
    } catch (error) {
      console.error("Failed to load recent contacts:", error);
      set({ recentContacts: [] });
    }
  },

  selectRecentContact: (contact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await database.deleteContact(phoneNumber);
      get().loadRecentContacts();
    } catch (error) {
      console.error("Failed to delete recent contact:", error);
    }
  },
}));

export type { Country };
