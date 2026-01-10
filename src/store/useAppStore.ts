import { create } from "zustand";
import * as Linking from "expo-linking";

interface Country {
  code: string;
  country: string;
  flag: string;
}

interface AppStore {
  phoneNumber: string;
  selectedCountry: Country;
  modalVisible: boolean;
  isPressed: boolean;
  setPhoneNumber: (phone: string) => void;
  setSelectedCountry: (country: Country) => void;
  setModalVisible: (visible: boolean) => void;
  setIsPressed: (pressed: boolean) => void;
  isValidNumber: () => boolean;
  startChat: () => void;
}

const COUNTRY_CODES = [
  { code: "+254", country: "KE", flag: "🇰🇪" },
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+62", country: "ID", flag: "🇮🇩" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+90", country: "TR", flag: "🇹🇷" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+20", country: "EG", flag: "🇪🇬" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+880", country: "BD", flag: "🇧🇩" },
  { code: "+84", country: "VN", flag: "🇻🇳" },
  { code: "+66", country: "TH", flag: "🇹🇭" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+48", country: "PL", flag: "🇵🇱" },
];

export const useAppStore = create<AppStore>((set, get) => ({
  phoneNumber: "",
  selectedCountry: COUNTRY_CODES[0],
  modalVisible: false,
  isPressed: false,
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setModalVisible: (visible) => set({ modalVisible: visible }),
  setIsPressed: (pressed) => set({ isPressed: pressed }),
  isValidNumber: () => get().phoneNumber.trim().length >= 6,
  startChat: () => {
    const { phoneNumber, selectedCountry } = get();
    if (!phoneNumber.trim()) return;

    const fullNumber = `${selectedCountry.code}${phoneNumber}`.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${fullNumber}`;
    Linking.openURL(whatsappUrl);
  },
}));

export { COUNTRY_CODES };
export type { Country };
