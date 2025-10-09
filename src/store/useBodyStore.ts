import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Pin, type Treatment } from "../types/Treatment";

// Dummy treatment data based on your example
const dummyTreatments: Treatment[] = [
  // Forehead area - Botox (purple dots)
  {
    id: "treatment-1",
    area: "Forehead",
    treatment: "Botox Cosmetic",
    dosage: "10 U",
    date: "2024-11-05",
    cost: 350,
    color: "#8B5CF6",
    position: { x: 0, y: 1.5, z: 0.1 },
    notes: "Horizontal forehead lines",
  },
  {
    id: "treatment-2",
    area: "Forehead",
    treatment: "Botox Cosmetic",
    dosage: "8 U",
    date: "2024-11-05",
    cost: 280,
    color: "#8B5CF6",
    position: { x: -0.3, y: 1.5, z: 0.1 },
  },
  {
    id: "treatment-3",
    area: "Forehead",
    treatment: "Botox Cosmetic",
    dosage: "8 U",
    date: "2024-11-05",
    cost: 280,
    color: "#8B5CF6",
    position: { x: 0.3, y: 1.5, z: 0.1 },
  },

  // Glabella (between eyebrows) - Botox
  {
    id: "treatment-4",
    area: "Glabella",
    treatment: "Botox Cosmetic",
    dosage: "35 U",
    date: "2024-11-05",
    cost: 420,
    color: "#8B5CF6",
    position: { x: 0, y: 1.2, z: 0.1 },
    notes: "Frown lines between eyebrows",
  },

  // Crows feet - Botox (purple dots)
  {
    id: "treatment-5",
    area: "Crows Feet",
    treatment: "Botox Cosmetic",
    dosage: "15 U",
    date: "2024-11-05",
    cost: 225,
    color: "#8B5CF6",
    position: { x: -0.8, y: 1.0, z: 0.1 },
  },
  {
    id: "treatment-6",
    area: "Crows Feet",
    treatment: "Botox Cosmetic",
    dosage: "15 U",
    date: "2024-11-05",
    cost: 225,
    color: "#8B5CF6",
    position: { x: 0.8, y: 1.0, z: 0.1 },
  },
  {
    id: "treatment-7",
    area: "Crows Feet",
    treatment: "Botox Cosmetic",
    dosage: "12 U",
    date: "2024-11-05",
    cost: 180,
    color: "#8B5CF6",
    position: { x: -0.9, y: 0.8, z: 0.1 },
  },
  {
    id: "treatment-8",
    area: "Crows Feet",
    treatment: "Botox Cosmetic",
    dosage: "12 U",
    date: "2024-11-05",
    cost: 180,
    color: "#8B5CF6",
    position: { x: 0.9, y: 0.8, z: 0.1 },
  },

  // Chin - Juvederm (orange/yellow dots)
  {
    id: "treatment-9",
    area: "Chin",
    treatment: "Juvederm Voluma",
    dosage: "2 mL",
    date: "2024-10-15",
    cost: 650,
    color: "#F59E0B",
    position: { x: -0.3, y: -0.5, z: 0.1 },
    notes: "Chin augmentation and definition",
  },
  {
    id: "treatment-10",
    area: "Chin",
    treatment: "Juvederm Voluma",
    dosage: "1.5 mL",
    date: "2024-10-15",
    cost: 500,
    color: "#F59E0B",
    position: { x: 0.3, y: -0.5, z: 0.1 },
  },

  // Lips - Juvederm (orange dots)
  {
    id: "treatment-11",
    area: "Lip",
    treatment: "Juvederm Volift",
    dosage: "1 mL",
    date: "2024-09-20",
    cost: 550,
    color: "#F59E0B",
    position: { x: -0.2, y: -0.2, z: 0.1 },
    notes: "Upper lip enhancement",
  },
  {
    id: "treatment-12",
    area: "Lip",
    treatment: "Juvederm Volift",
    dosage: "1 mL",
    date: "2024-09-20",
    cost: 550,
    color: "#F59E0B",
    position: { x: 0.2, y: -0.2, z: 0.1 },
    notes: "Lower lip enhancement",
  },

  // Additional forehead points
  {
    id: "treatment-13",
    area: "Forehead",
    treatment: "Botox Cosmetic",
    dosage: "6 U",
    date: "2024-11-05",
    cost: 210,
    color: "#8B5CF6",
    position: { x: -0.5, y: 1.4, z: 0.1 },
  },
  {
    id: "treatment-14",
    area: "Forehead",
    treatment: "Botox Cosmetic",
    dosage: "6 U",
    date: "2024-11-05",
    cost: 210,
    color: "#8B5CF6",
    position: { x: 0.5, y: 1.4, z: 0.1 },
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

  // Camera state
  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };

  // Actions
  addPin: (pin: Pin) => void;
  updatePin: (id: string, comment: string) => void;
  updateTreatment: (id: string, treatment: Treatment) => void;
  removePin: (id: string) => void;
  setIsAddingPin: (isAdding: boolean) => void;
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
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set, get) => ({
      // Initial state
      pins: initialPins,
      isAddingPin: false,
      cameraPosition: { x: 0, y: 0, z: 5 },
      cameraTarget: { x: 0, y: 0, z: 0 },

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

      updateCameraPosition: (position) =>
        set({ cameraPosition: position }),

      updateCameraTarget: (target) => set({ cameraTarget: target }),

      resetCamera: () =>
        set({
          cameraPosition: { x: 0, y: 0, z: 5 },
          cameraTarget: { x: 0, y: 0, z: 0 },
        }),

      clearAllPins: () => set({ pins: [] }),
    }),
    {
      name: "body3d-storage",
      partialize: (state) => ({
        pins: state.pins,
        cameraPosition: state.cameraPosition,
        cameraTarget: state.cameraTarget,
      }),
    }
  )
);
