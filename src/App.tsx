import { useCallback, useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";
import Body, { type BodyRef } from "./components/Body";
import CameraControls, {
  type CameraControlsRef,
} from "./components/CameraControls";
import { useBodyStore } from "./store/useBodyStore";
import {
  type Pin,
  type Treatment,
  type Line as LineType,
} from "./types/Treatment";
import PinList from "./components/PinList";
import TreatmentForm from "./components/TreatmentForm";
import PrintButton from "./components/PrintButton";
import CanvasCapture, {
  type CanvasCaptureRef,
} from "./components/CanvasCapture";
import "./App.css";

function App() {
  const {
    pins,
    lines,
    isAddingPin,
    isDrawingLine,
    orbitControlsEnabled,
    setIsAddingPin,
    setIsDrawingLine,
    setOrbitControlsEnabled,
    addPin,
    updatePin,
    updateTreatment,
    removePin,
    addLine,
    updateLine,
    removeLine,
    clearAllPins,
    clearAllLines,
    initializePins,
  } = useBodyStore();

  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(
    null
  );

  const cameraControlsRef = useRef<CameraControlsRef>(null);
  const bodyRef = useRef<BodyRef>(null);
  const canvasCaptureRef = useRef<CanvasCaptureRef>(null);

  useEffect(() => {
    initializePins();
  }, [initializePins]);

  const handleAddPin = useCallback(
    (pin: Pin) => {
      addPin(pin);
    },
    [addPin]
  );

  const handleUpdatePin = useCallback(
    (id: string, comment: string) => {
      updatePin(id, comment);
    },
    [updatePin]
  );

  const handleRemovePin = useCallback(
    (id: string) => {
      removePin(id);
    },
    [removePin]
  );

  const handleAddLine = useCallback(
    (line: LineType) => {
      console.log("App handleAddLine called with:", line);
      addLine(line);
    },
    [addLine]
  );

  const handleUpdateLine = useCallback(
    (id: string, text: string) => {
      updateLine(id, text);
    },
    [updateLine]
  );

  const handleRemoveLine = useCallback(
    (id: string) => {
      removeLine(id);
    },
    [removeLine]
  );

  const handleSavePins = useCallback(() => {
    alert("Pins saved successfully!");
  }, []);

  const handleLoadPins = useCallback(() => {
    alert("Pins loaded successfully!");
  }, []);

  const handleClearPins = useCallback(() => {
    if (confirm("Are you sure you want to clear all pins?")) {
      clearAllPins();
    }
  }, [clearAllPins]);

  const handleClearLines = useCallback(() => {
    if (confirm("Are you sure you want to clear all lines?")) {
      clearAllLines();
    }
  }, [clearAllLines]);

  const handleTogglePinMode = useCallback(() => {
    setIsAddingPin(!isAddingPin);
  }, [isAddingPin, setIsAddingPin]);

  const handleToggleLineMode = useCallback(() => {
    setIsDrawingLine(!isDrawingLine);
  }, [isDrawingLine, setIsDrawingLine]);

  const handleCameraChange = useCallback(
    (position: Vector3, target: Vector3) => {
      if (bodyRef.current) {
        bodyRef.current.zoomToPosition(position, target);
      }
    },
    []
  );

  const handleOpenTreatmentForm = useCallback((pinId: string) => {
    setSelectedPinId(pinId);
    setTreatmentFormOpen(true);
  }, []);

  const handleCloseTreatmentForm = useCallback(() => {
    setTreatmentFormOpen(false);
    setSelectedPinId(null);
  }, []);

  const handleSaveTreatment = useCallback(
    (treatment: Treatment) => {
      if (selectedPinId) {
        updateTreatment(selectedPinId, treatment);
      }
      handleCloseTreatmentForm();
    },
    [selectedPinId, updateTreatment, handleCloseTreatmentForm]
  );

  const PointerMissedHandler = () => {
    const { camera } = useThree();

    const handlePointerMissed = useCallback(
      (event: MouseEvent) => {
        // Only handle missed clicks when in pin mode and orbit controls are disabled
        if (!isAddingPin || orbitControlsEnabled) return;

        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        const vector = new THREE.Vector3(x, y, 0.5);
        vector.unproject(camera);

        const direction = vector.sub(camera.position).normalize();

        const distance = 10;
        const position = camera.position
          .clone()
          .add(direction.multiplyScalar(distance));

        const newPin: Pin = {
          id: Date.now().toString(),
          position: {
            x: position.x,
            y: position.y,
            z: position.z,
          },
          comment: "",
        };
        addPin(newPin);
      },
      [camera, isAddingPin, orbitControlsEnabled, addPin]
    );

    useEffect(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.addEventListener("click", handlePointerMissed);
        return () =>
          canvas.removeEventListener("click", handlePointerMissed);
      }
    }, [handlePointerMissed]);

    return null;
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
      }}
    >
      <PinList
        onZoomToPin={(pinId) => bodyRef.current?.zoomToPin(pinId)}
      />

      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 100,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            minWidth: "250px",
          }}
        >
          <h2 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
            3D Body Viewer
          </h2>

          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={handleTogglePinMode}
              style={{
                background: isAddingPin ? "#f44336" : "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
                marginBottom: "8px",
              }}
            >
              {isAddingPin ? "Cancel Adding Pin" : "Add Pin Mode"}
            </button>
            {isAddingPin && (
              <p
                style={{
                  fontSize: "12px",
                  margin: "5px 0 0 0",
                  color: "#ccc",
                }}
              >
                Click on the body to add a pin
                <br />
                <span
                  style={{ color: "#ff6b6b", fontWeight: "bold" }}
                >
                  Orbit controls disabled
                </span>
              </p>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <button
              onClick={handleToggleLineMode}
              style={{
                background: isDrawingLine ? "#f44336" : "#FF6B6B",
                color: "white",
                border: "none",
                padding: "10px 15px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                width: "100%",
                marginBottom: "8px",
              }}
            >
              {isDrawingLine
                ? "Cancel Drawing Line"
                : "Draw Line Mode"}
            </button>
            {isDrawingLine && (
              <p
                style={{
                  fontSize: "12px",
                  margin: "5px 0 0 0",
                  color: "#ccc",
                }}
              >
                Click two points on the body to draw a line
                <br />
                <span
                  style={{ color: "#ff6b6b", fontWeight: "bold" }}
                >
                  Orbit controls disabled
                </span>
              </p>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
              Mouse Controls:
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                fontSize: "12px",
              }}
            >
              <li>Left click + drag: Rotate</li>
              <li>Right click + drag: Pan</li>
              <li>Scroll: Zoom in/out</li>
            </ul>
            <div
              style={{
                fontSize: "11px",
                margin: "8px 0 0 0",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: orbitControlsEnabled
                  ? "#4CAF50"
                  : "#f44336",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {orbitControlsEnabled
                ? "✓ Orbit Controls Active"
                : "✗ Orbit Controls Disabled"}
            </div>
            <p
              style={{
                fontSize: "11px",
                margin: "8px 0 0 0",
                color: "#ccc",
              }}
            >
              Use the camera controls on the right to zoom to specific
              body parts
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <button
              onClick={handleSavePins}
              style={{
                background: "#2196F3",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                flex: 1,
              }}
            >
              Save Pins
            </button>
            <button
              onClick={handleLoadPins}
              style={{
                background: "#FF9800",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                flex: 1,
              }}
            >
              Load Pins
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <button
              onClick={handleClearPins}
              style={{
                background: "#f44336",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                flex: 1,
              }}
            >
              Clear Pins
            </button>
            <button
              onClick={handleClearLines}
              style={{
                background: "#FF6B6B",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                flex: 1,
              }}
            >
              Clear Lines
            </button>
          </div>

          <button
            onClick={initializePins}
            style={{
              background: "#9C27B0",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            Load Demo Pins
          </button>

          <PrintButton
            onZoomToPin={(pinId) => bodyRef.current?.zoomToPin(pinId)}
            onCaptureCanvas={async () => {
              if (canvasCaptureRef.current) {
                return await canvasCaptureRef.current.captureCanvas();
              }
              throw new Error("Canvas capture not available");
            }}
          />

          <div
            style={{
              marginTop: "15px",
              fontSize: "12px",
              color: "#ccc",
            }}
          >
            Pins: {pins.length} | Lines: {lines.length}
          </div>
        </div>

        <CameraControls
          ref={cameraControlsRef}
          onCameraChange={handleCameraChange}
        />

        <Canvas
          camera={{ position: [0, 25, 190], fov: 50 }}
          style={{ background: "#f0f0f0", flex: 1 }}
        >
          <PointerMissedHandler />
          <Body
            ref={bodyRef}
            pins={pins}
            lines={lines}
            onAddPin={handleAddPin}
            onUpdatePin={handleUpdatePin}
            onRemovePin={handleRemovePin}
            onAddLine={handleAddLine}
            onUpdateLine={handleUpdateLine}
            onRemoveLine={handleRemoveLine}
            isAddingPin={isAddingPin}
            isDrawingLine={isDrawingLine}
            onOpenTreatmentForm={handleOpenTreatmentForm}
            treatmentFormOpen={treatmentFormOpen}
          />
          <CanvasCapture ref={canvasCaptureRef} />
        </Canvas>
      </div>

      {treatmentFormOpen && selectedPinId && (
        <TreatmentForm
          isOpen={treatmentFormOpen}
          onClose={handleCloseTreatmentForm}
          onSave={handleSaveTreatment}
          pinPosition={
            new Vector3(
              pins.find((p) => p.id === selectedPinId)?.position.x ||
                0,
              pins.find((p) => p.id === selectedPinId)?.position.y ||
                0,
              pins.find((p) => p.id === selectedPinId)?.position.z ||
                0
            )
          }
          pinId={selectedPinId}
          existingTreatment={
            pins.find((p) => p.id === selectedPinId)?.treatment
          }
        />
      )}
    </div>
  );
}

export default App;
