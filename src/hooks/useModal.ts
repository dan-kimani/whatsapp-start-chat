import { create } from "zustand";

type ModalName = "menu" | "reminder" | null;

interface ModalState {
  active: ModalName;
  params: Record<string, unknown> | null;
  open: (name: ModalName, params?: Record<string, unknown>) => void;
  close: () => void;
}

export const useModal = create<ModalState>((set) => ({
  active: null,
  params: null,
  open: (name, params) => set({ active: name, params: params ?? null }),
  close: () => set({ active: null, params: null }),
}));

export interface MenuParams {
  contact: { phoneNumber: string; countryCode: string; country: string; flag: string; usedAt: Date };
  contactName?: string;
  position: { top: number; right: number };
  onCall: () => void;
  onWhatsApp: () => void;
  onSave: () => void;
  onRemind: () => void;
}

export interface ReminderParams {
  phoneNumber: string;
  countryCode: string;
  contactName?: string;
}
