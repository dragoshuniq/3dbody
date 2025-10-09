import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Vector3 } from "three";
import Body from "./components/Body";
import "./App.css";

interface Pin {
  id: string;
  position: Vector3;
  comment: string;
}

function App() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [isAddingPin, setIsAddingPin] = useState(false);

  const handleAddPin = useCallback((pin: Pin) => {
    setPins((prev) => [...prev, pin]);
    setIsAddingPin(false);
  }, []);

  const handleUpdatePin = useCallback(
    (id: string, comment: string) => {
      setPins((prev) =>
        prev.map((pin) => (pin.id === id ? { ...pin, comment } : pin))
      );
    },
    []
  );

  const handleRemovePin = useCallback((id: string) => {
    setPins((prev) => prev.filter((pin) => pin.id !== id));
  }, []);

  const handleSavePins = useCallback(() => {
    const pinsData = pins.map((pin) => ({
      id: pin.id,
      position: {
        x: pin.position.x,
        y: pin.position.y,
        z: pin.position.z,
      },
      comment: pin.comment,
    }));

    // Save to localStorage
    localStorage.setItem("body3d-pins", JSON.stringify(pinsData));
    alert("Pins saved successfully!");
  }, [pins]);

  const handleLoadPins = useCallback(() => {
    const savedPins = localStorage.getItem("body3d-pins");
    if (savedPins) {
      const pinsData = JSON.parse(savedPins);
      const loadedPins = pinsData.map(
        (pin: {
          id: string;
          position: { x: number; y: number; z: number };
          comment: string;
        }) => ({
          id: pin.id,
          position: new Vector3(
            pin.position.x,
            pin.position.y,
            pin.position.z
          ),
          comment: pin.comment,
        })
      );
      setPins(loadedPins);
      alert("Pins loaded successfully!");
    } else {
      alert("No saved pins found.");
    }
  }, []);

  const handleClearPins = useCallback(() => {
    if (confirm("Are you sure you want to clear all pins?")) {
      setPins([]);
    }
  }, []);

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
            Controls:
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

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "#f0f0f0" }}
      >
        <Body
          pins={pins}
          onAddPin={handleAddPin}
          onUpdatePin={handleUpdatePin}
          onRemovePin={handleRemovePin}
        />
      </Canvas>
    </div>
  );
}

export default App;
