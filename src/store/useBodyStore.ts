import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Pin, type Treatment } from "../types/Treatment";
import dayjs from "dayjs";

// 3 Dummy treatment data with visible positions for 0.5 scale model
const dummyTreatments: Treatment[] = [
  // Face treatment - positioned on the face area
  {
    id: "treatment-1",
    area: "Face",
    treatment: "Botox Cosmetic",
    dosage: "15 U",
    date: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    cost: 450,
    color: "#8B5CF6",
    position: { x: 0, y: 75, z: 10 },
    notes: "Facial rejuvenation treatment",
  },
  // Chest treatment - positioned on the chest area
  {
    id: "treatment-2",
    area: "Chest",
    treatment: "Juvederm Voluma",
    dosage: "2.5 mL",
    date: dayjs().subtract(2, "month").format("YYYY-MM-DD"),
    cost: 750,
    color: "#F59E0B",
    position: { x: 0, y: 25, z: 10 },
    notes: "Chest contouring and enhancement",
  },
  // Legs treatment - positioned on the legs area
  {
    id: "treatment-3",
    area: "Legs",
    treatment: "Sculptra",
    dosage: "5 mL",
    date: dayjs().subtract(3, "month").format("YYYY-MM-DD"),
    cost: 1200,
    color: "#10B981",
    position: { x: 0, y: -50, z: 10 },
    notes: "Leg contouring and volume restoration",
  },
];

// Create initial pins from dummy treatments
const initialPins: Pin[] = dummyTreatments.map((treatment) => ({
  id: treatment.id,
  position: treatment.position,
  treatment,
  comment: "",
}));

interface BodyState {
  // Pins state
  pins: Pin[];
  isAddingPin: boolean;
  selectedPinId: string | null;

  // Camera state
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };

  // Actions
  addPin: (pin: Pin) => void;
  updatePin: (id: string, comment: string) => void;
  updateTreatment: (id: string, treatment: Treatment) => void;
  removePin: (id: string) => void;
  setIsAddingPin: (isAdding: boolean) => void;
  setSelectedPin: (id: string | null) => void;
  updateCameraPosition: (position: {
    x: number;
    y: number;
    z: number;
  }) => void;
  updateCameraTarget: (target: {
    x: number;
    y: number;
    z: number;
  }) => void;
  resetCamera: () => void;
  clearAllPins: () => void;
  initializePins: () => void;
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      pins: initialPins,
      isAddingPin: false,
      selectedPinId: null,
      cameraPosition: { x: 0, y: 25, z: 190 },
      cameraTarget: { x: 0, y: 25, z: 0 },

      // Actions
      addPin: (pin) =>
        set((state) => ({
          pins: [...state.pins, pin],
          isAddingPin: false,
        })),

      updatePin: (id, comment) =>
        set((state) => ({
          pins: state.pins.map((pin) =>
            pin.id === id ? { ...pin, comment } : pin
          ),
        })),

      updateTreatment: (id, treatment) =>
        set((state) => ({
          pins: state.pins.map((pin) =>
            pin.id === id ? { ...pin, treatment } : pin
          ),
        })),

      removePin: (id) =>
        set((state) => ({
          pins: state.pins.filter((pin) => pin.id !== id),
        })),

      setIsAddingPin: (isAdding) => set({ isAddingPin: isAdding }),

      setSelectedPin: (id) => set({ selectedPinId: id }),

      updateCameraPosition: (position) =>
        set({ cameraPosition: position }),

      updateCameraTarget: (target) => set({ cameraTarget: target }),

      resetCamera: () =>
        set({
          cameraPosition: { x: 0, y: 25, z: 190 },
          cameraTarget: { x: 0, y: 25, z: 0 },
        }),

      clearAllPins: () => set({ pins: [] }),

      // Initialize pins if empty
      initializePins: () => {
        const currentState = get();
        if (currentState.pins.length === 0) {
          set({ pins: initialPins });
        }
      },
    }),
    {
      name: "body3d-storage",
      partialize: (state) => ({
        pins: state.pins,
        cameraPosition: state.cameraPosition,
        cameraTarget: state.cameraTarget,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize pins if they're empty after rehydration
        if (state && state.pins.length === 0) {
          state.pins = initialPins;
        }
      },
    }
  )
);
