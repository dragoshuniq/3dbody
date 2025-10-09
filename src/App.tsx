import { useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import Body, { type BodyRef } from "./components/Body";
import CameraControls, {
  type CameraControlsRef,
} from "./components/CameraControls";
import { useBodyStore } from "./store/useBodyStore";
import { type Pin, type Treatment } from "./types/Treatment";
import PinList from "./components/PinList";
import "./App.css";

function App() {
  const {
    pins,
    isAddingPin,
    setIsAddingPin,
    addPin,
    updatePin,
    updateTreatment,
    removePin,
    clearAllPins,
  } = useBodyStore();

  const cameraControlsRef = useRef<CameraControlsRef>(null);
  const bodyRef = useRef<BodyRef>(null);

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

  const handleUpdateTreatment = useCallback(
    (id: string, treatment: Treatment) => {
      updateTreatment(id, treatment);
    },
    [updateTreatment]
  );

  const handleRemovePin = useCallback(
    (id: string) => {
      removePin(id);
    },
    [removePin]
  );

  const handleSavePins = useCallback(() => {
    // Data is automatically saved by Zustand persist middleware
    alert("Pins saved successfully!");
  }, []);

  const handleLoadPins = useCallback(() => {
    // Data is automatically loaded by Zustand persist middleware
    alert("Pins loaded successfully!");
  }, []);

  const handleClearPins = useCallback(() => {
    if (confirm("Are you sure you want to clear all pins?")) {
      clearAllPins();
    }
  }, [clearAllPins]);

  const handleCameraChange = useCallback(
    (position: Vector3, target: Vector3) => {
      if (bodyRef.current) {
        bodyRef.current.zoomToPosition(position, target);
      }
    },
    []
  );

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Control Panel */}
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
            onClick={() => setIsAddingPin(!isAddingPin)}
            style={{
              background: isAddingPin ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              width: "100%",
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
            width: "100%",
          }}
        >
          Clear All Pins
        </button>

        <div
          style={{
            marginTop: "15px",
            fontSize: "12px",
            color: "#ccc",
          }}
        >
          Pins: {pins.length}
        </div>
      </div>

      {/* Pin List */}
      <PinList />

      {/* Camera Controls */}
      <CameraControls
        ref={cameraControlsRef}
        onCameraChange={handleCameraChange}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "#f0f0f0" }}
      >
        <Body
          ref={bodyRef}
          pins={pins}
          onAddPin={handleAddPin}
          onUpdatePin={handleUpdatePin}
          onRemovePin={handleRemovePin}
          onUpdateTreatment={handleUpdateTreatment}
          isAddingPin={isAddingPin}
        />
      </Canvas>
    </div>
  );
}

export default App;
