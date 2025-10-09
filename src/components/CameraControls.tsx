import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Vector3 } from "three";
import {
  FaHome,
  FaEye,
  FaUser,
  FaHands,
  FaRunning,
  FaHeart,
  FaBrain,
  FaLungs,
  FaBone,
} from "react-icons/fa";

export interface CameraControlsRef {
  zoomToFace: () => void;
  zoomToChest: () => void;
  zoomToHands: () => void;
  zoomToLegs: () => void;
  zoomToHeart: () => void;
  zoomToHead: () => void;
  zoomToLungs: () => void;
  zoomToSpine: () => void;
  resetCamera: () => void;
}

interface CameraControlsProps {
  onCameraChange: (position: Vector3, target: Vector3) => void;
}

const CameraControls = forwardRef<
  CameraControlsRef,
  CameraControlsProps
>(({ onCameraChange }, ref) => {
  const cameraPresets = {
    face: {
      position: new Vector3(0, 1.5, 1.5),
      target: new Vector3(0, 1.5, 0),
      label: "Face",
      icon: FaEye,
      color: "#4CAF50",
    },
    chest: {
      position: new Vector3(0, 0.5, 2),
      target: new Vector3(0, 0.5, 0),
      label: "Chest",
      icon: FaUser,
      color: "#2196F3",
    },
    hands: {
      position: new Vector3(1.5, 0.5, 1),
      target: new Vector3(1.5, 0.5, 0),
      label: "Hands",
      icon: FaHands,
      color: "#FF9800",
    },
    legs: {
      position: new Vector3(0, -1, 2),
      target: new Vector3(0, -1, 0),
      label: "Legs",
      icon: FaRunning,
      color: "#9C27B0",
    },
    heart: {
      position: new Vector3(0.3, 0.3, 1.5),
      target: new Vector3(0.3, 0.3, 0),
      label: "Heart",
      icon: FaHeart,
      color: "#f44336",
    },
    head: {
      position: new Vector3(0, 2, 1),
      target: new Vector3(0, 2, 0),
      label: "Head",
      icon: FaBrain,
      color: "#607D8B",
    },
    lungs: {
      position: new Vector3(0, 0.8, 1.8),
      target: new Vector3(0, 0.8, 0),
      label: "Lungs",
      icon: FaLungs,
      color: "#00BCD4",
    },
    spine: {
      position: new Vector3(0.1, 0, 2),
      target: new Vector3(0.1, 0, 0),
      label: "Spine",
      icon: FaBone,
      color: "#795548",
    },
  };

  const handleZoomToPreset = (preset: keyof typeof cameraPresets) => {
    const { position, target } = cameraPresets[preset];
    onCameraChange(position, target);
  };

  const handleResetCamera = () => {
    const position = new Vector3(0, 0, 5);
    const target = new Vector3(0, 0, 0);
    onCameraChange(position, target);
  };

  useImperativeHandle(ref, () => ({
    zoomToFace: () => handleZoomToPreset("face"),
    zoomToChest: () => handleZoomToPreset("chest"),
    zoomToHands: () => handleZoomToPreset("hands"),
    zoomToLegs: () => handleZoomToPreset("legs"),
    zoomToHeart: () => handleZoomToPreset("heart"),
    zoomToHead: () => handleZoomToPreset("head"),
    zoomToLungs: () => handleZoomToPreset("lungs"),
    zoomToSpine: () => handleZoomToPreset("spine"),
    resetCamera: handleResetCamera,
  }));

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        minWidth: "200px",
      }}
    >
      <h3
        style={{
          margin: "0 0 15px 0",
          fontSize: "16px",
          textAlign: "center",
        }}
      >
        Camera Controls
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          marginBottom: "15px",
        }}
      >
        {Object.entries(cameraPresets).map(([key, preset]) => {
          const IconComponent = preset.icon;
          return (
            <button
              key={key}
              onClick={() =>
                handleZoomToPreset(key as keyof typeof cameraPresets)
              }
              style={{
                background: preset.color,
                color: "white",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <IconComponent size={16} />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleResetCamera}
        style={{
          background: "#607D8B",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#455A64";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#607D8B";
        }}
      >
        <FaHome size={16} />
        Reset View
      </button>
    </div>
  );
});

CameraControls.displayName = "CameraControls";

export default CameraControls;
