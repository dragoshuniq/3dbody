import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Pin,
  type Treatment,
  type Line,
} from "../types/Treatment";
import dayjs from "dayjs";

const dummyTreatments: Treatment[] = [
  {
    id: "treatment-1",
    area: "Face",
    treatment: "Botox Cosmetic",
    dosage: "15 U",
    date: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    cost: 450,
    color: "#8B5CF6",
    position: { x: 0, y: 65, z: 5 },
    notes: "Facial rejuvenation treatment",
  },
  {
    id: "treatment-2",
    area: "Chest",
    treatment: "Juvederm Voluma",
    dosage: "2.5 mL",
    date: dayjs().subtract(2, "month").format("YYYY-MM-DD"),
    cost: 750,
    color: "#F59E0B",
    position: { x: 0, y: 50, z: 4.1 },
    notes: "Chest contouring and enhancement",
  },
  {
    id: "treatment-3",
    area: "Legs",
    treatment: "Sculptra",
    dosage: "5 mL",
    date: dayjs().subtract(3, "month").format("YYYY-MM-DD"),
    cost: 1200,
    color: "#10B981",
    position: { x: 7, y: 0, z: 3 },
    notes: "Leg contouring and volume restoration",
  },
];

const initialPins: Pin[] = dummyTreatments.map((treatment) => ({
  id: treatment.id,
  position: treatment.position,
  treatment,
  comment: "",
}));

interface BodyState {
  pins: Pin[];
  lines: Line[];
  isAddingPin: boolean;
  isDrawingLine: boolean;
  selectedPinId: string | null;
  selectedLineId: string | null;
  lineDrawingState: "idle" | "startPoint" | "endPoint";
  orbitControlsEnabled: boolean;

  cameraPosition: { x: number; y: number; z: number };
  cameraTarget: { x: number; y: number; z: number };

  addPin: (pin: Pin) => void;
  updatePin: (id: string, comment: string) => void;
  updateTreatment: (id: string, treatment: Treatment) => void;
  removePin: (id: string) => void;
  setIsAddingPin: (isAdding: boolean) => void;
  setSelectedPin: (id: string | null) => void;

  addLine: (line: Line) => void;
  updateLine: (id: string, text: string) => void;
  removeLine: (id: string) => void;
  setIsDrawingLine: (isDrawing: boolean) => void;
  setSelectedLine: (id: string | null) => void;
  setLineDrawingState: (
    state: "idle" | "startPoint" | "endPoint"
  ) => void;
  setOrbitControlsEnabled: (enabled: boolean) => void;
  clearAllLines: () => void;

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
      lines: [],
      isAddingPin: false,
      isDrawingLine: false,
      selectedPinId: null,
      selectedLineId: null,
      lineDrawingState: "idle",
      orbitControlsEnabled: true,
      cameraPosition: { x: 0, y: 25, z: 190 },
      cameraTarget: { x: 0, y: 25, z: 0 },

      addPin: (pin) =>
        set((state) => ({
          pins: [...state.pins, pin],
          isAddingPin: false,
          orbitControlsEnabled: true,
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

      setIsAddingPin: (isAdding) =>
        set({
          isAddingPin: isAdding,
          orbitControlsEnabled: !isAdding,
        }),

      setSelectedPin: (id) => set({ selectedPinId: id }),

      addLine: (line) => {
        console.log("Store addLine called with:", line);
        set((state) => {
          const newLines = [...state.lines, line];
          console.log("New lines array:", newLines);
          return {
            lines: newLines,
            isDrawingLine: false,
            lineDrawingState: "idle",
            orbitControlsEnabled: true,
          };
        });
      },

      updateLine: (id, text) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id ? { ...line, text } : line
          ),
        })),

      removeLine: (id) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.id !== id),
        })),

      setIsDrawingLine: (isDrawing) =>
        set({
          isDrawingLine: isDrawing,
          orbitControlsEnabled: !isDrawing,
        }),

      setSelectedLine: (id) => set({ selectedLineId: id }),

      setLineDrawingState: (state) =>
        set({ lineDrawingState: state }),

      setOrbitControlsEnabled: (enabled) =>
        set({ orbitControlsEnabled: enabled }),

      clearAllLines: () => set({ lines: [] }),

      updateCameraPosition: (position) =>
        set({ cameraPosition: position }),

      updateCameraTarget: (target) => set({ cameraTarget: target }),

      resetCamera: () =>
        set({
          cameraPosition: { x: 0, y: 25, z: 190 },
          cameraTarget: { x: 0, y: 25, z: 0 },
        }),

      clearAllPins: () => set({ pins: [] }),

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
        lines: state.lines,
        cameraPosition: state.cameraPosition,
        cameraTarget: state.cameraTarget,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.pins.length === 0) {
          state.pins = initialPins;
        }
      },
    }
  )
);
