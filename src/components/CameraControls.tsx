import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
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
  FaEdit,
  FaCopy,
} from "react-icons/fa";
import { useBodyStore } from "../store/useBodyStore";

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
  onPositionUpdate?: (position: Vector3, target: Vector3) => void;
}

const CameraControls = forwardRef<
  CameraControlsRef,
  CameraControlsProps
>(({ onCameraChange, onPositionUpdate }, ref) => {
  const {
    cameraPosition,
    cameraTarget,
    updateCameraPosition,
    updateCameraTarget,
  } = useBodyStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editPosition, setEditPosition] = useState(cameraPosition);
  const [editTarget, setEditTarget] = useState(cameraTarget);
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

  // Update edit values when store values change
  useEffect(() => {
    setEditPosition(cameraPosition);
    setEditTarget(cameraTarget);
  }, [cameraPosition, cameraTarget]);

  const handleZoomToPreset = (preset: keyof typeof cameraPresets) => {
    const { position, target } = cameraPresets[preset];
    onCameraChange(position, target);
    updateCameraPosition({
      x: position.x,
      y: position.y,
      z: position.z,
    });
    updateCameraTarget({ x: target.x, y: target.y, z: target.z });
  };

  const handleResetCamera = () => {
    const position = new Vector3(0, 0, 5);
    const target = new Vector3(0, 0, 0);
    onCameraChange(position, target);
    updateCameraPosition({ x: 0, y: 0, z: 5 });
    updateCameraTarget({ x: 0, y: 0, z: 0 });
  };

  const handleSavePosition = () => {
    updateCameraPosition(editPosition);
    updateCameraTarget(editTarget);
    const position = new Vector3(
      editPosition.x,
      editPosition.y,
      editPosition.z
    );
    const target = new Vector3(
      editTarget.x,
      editTarget.y,
      editTarget.z
    );
    onCameraChange(position, target);
    setIsEditing(false);
  };

  const handleCopyPosition = () => {
    const positionText = `Position: { x: ${cameraPosition.x.toFixed(
      3
    )}, y: ${cameraPosition.y.toFixed(
      3
    )}, z: ${cameraPosition.z.toFixed(3)} }`;
    const targetText = `Target: { x: ${cameraTarget.x.toFixed(
      3
    )}, y: ${cameraTarget.y.toFixed(3)}, z: ${cameraTarget.z.toFixed(
      3
    )} }`;
    navigator.clipboard.writeText(`${positionText}\n${targetText}`);
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

      {/* Real-time Position Display */}
      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "15px",
          fontSize: "11px",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
          Current Position:
        </div>
        <div style={{ marginBottom: "4px" }}>
          Pos: ({cameraPosition.x.toFixed(2)},{" "}
          {cameraPosition.y.toFixed(2)}, {cameraPosition.z.toFixed(2)}
          )
        </div>
        <div style={{ marginBottom: "8px" }}>
          Target: ({cameraTarget.x.toFixed(2)},{" "}
          {cameraTarget.y.toFixed(2)}, {cameraTarget.z.toFixed(2)})
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={handleCopyPosition}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FaCopy size={10} />
            Copy
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              background: isEditing ? "#f44336" : "#2196F3",
              color: "white",
              border: "none",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FaEdit size={10} />
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {/* Manual Position Editor */}
      {isEditing && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
            fontSize: "11px",
          }}
        >
          <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
            Manual Position Editor:
          </div>
          <div style={{ display: "grid", gap: "6px" }}>
            <div>
              <label
                style={{ display: "block", marginBottom: "2px" }}
              >
                Position X:
              </label>
              <input
                type="number"
                value={editPosition.x}
                onChange={(e) =>
                  setEditPosition((prev) => ({
                    ...prev,
                    x: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.1"
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  fontSize: "10px",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: "2px" }}
              >
                Position Y:
              </label>
              <input
                type="number"
                value={editPosition.y}
                onChange={(e) =>
                  setEditPosition((prev) => ({
                    ...prev,
                    y: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.1"
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  fontSize: "10px",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: "2px" }}
              >
                Position Z:
              </label>
              <input
                type="number"
                value={editPosition.z}
                onChange={(e) =>
                  setEditPosition((prev) => ({
                    ...prev,
                    z: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.1"
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  fontSize: "10px",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: "2px" }}
              >
                Target X:
              </label>
              <input
                type="number"
                value={editTarget.x}
                onChange={(e) =>
                  setEditTarget((prev) => ({
                    ...prev,
                    x: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.1"
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  fontSize: "10px",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: "2px" }}
              >
                Target Y:
              </label>
              <input
                type="number"
                value={editTarget.y}
                onChange={(e) =>
                  setEditTarget((prev) => ({
                    ...prev,
                    y: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.1"
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  fontSize: "10px",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: "2px" }}
              >
                Target Z:
              </label>
              <input
                type="number"
                value={editTarget.z}
                onChange={(e) =>
                  setEditTarget((prev) => ({
                    ...prev,
                    z: parseFloat(e.target.value) || 0,
                  }))
                }
                step="0.1"
                style={{
                  width: "100%",
                  padding: "4px",
                  border: "1px solid #ccc",
                  borderRadius: "3px",
                  fontSize: "10px",
                }}
              />
            </div>
            <button
              onClick={handleSavePosition}
              style={{
                background: "#4CAF50",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "10px",
                cursor: "pointer",
                marginTop: "4px",
              }}
            >
              Apply Position
            </button>
          </div>
        </div>
      )}

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
