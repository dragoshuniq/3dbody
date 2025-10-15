import React, { useState, useRef } from "react";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import * as THREE from "three";
import { type Line } from "../types/Treatment";
import { useBodyStore } from "../store/useBodyStore";

interface LineComponentProps {
  line: Line;
  onUpdateText: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

const LineComponent: React.FC<LineComponentProps> = ({
  line,
  onUpdateText,
  onRemove,
}) => {
  console.log("LineComponent rendering with line:", line);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(line.text);
  const { selectedLineId, setSelectedLine } = useBodyStore();
  const lineRef = useRef<THREE.Group>(null);

  const isSelected = selectedLineId === line.id;

  const startPoint = new Vector3(
    line.startPoint.x,
    line.startPoint.y,
    line.startPoint.z
  );
  const endPoint = new Vector3(
    line.endPoint.x,
    line.endPoint.y,
    line.endPoint.z
  );

  // Calculate midpoint for text positioning
  const midpoint = new Vector3()
    .addVectors(startPoint, endPoint)
    .multiplyScalar(0.5);

  // Calculate line direction for text orientation
  const direction = new Vector3()
    .subVectors(endPoint, startPoint)
    .normalize();

  // Calculate perpendicular vector for text offset
  const up = new Vector3(0, 1, 0);
  const right = new Vector3().crossVectors(direction, up).normalize();
  const textOffset = right.multiplyScalar(0.3);

  const handleLineClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLine(isSelected ? null : line.id);
  };

  const handleSave = () => {
    onUpdateText(line.id, text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(line.text);
    setIsEditing(false);
  };

  return (
    <group ref={lineRef}>
      {/* 2D Line on surface */}
      <mesh onClick={handleLineClick}>
        <planeGeometry
          args={[startPoint.distanceTo(endPoint), 0.1]}
        />
        <meshStandardMaterial
          color={line.color}
          emissive={isSelected ? line.color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
          side={THREE.DoubleSide}
        />
        <group position={midpoint}>
          <group
            rotation={[
              Math.atan2(
                direction.y,
                Math.sqrt(
                  direction.x * direction.x +
                    direction.z * direction.z
                )
              ),
              Math.atan2(direction.x, direction.z),
              0,
            ]}
          >
            <primitive object={new THREE.Object3D()} />
          </group>
        </group>
      </mesh>

      {/* Start point marker */}
      <mesh position={startPoint} onClick={handleLineClick}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial
          color={line.color}
          emissive={isSelected ? line.color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* End point marker */}
      <mesh position={endPoint} onClick={handleLineClick}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial
          color={line.color}
          emissive={isSelected ? line.color : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Text label */}
      {isSelected && (
        <Html
          position={[
            midpoint.x + textOffset.x,
            midpoint.y + textOffset.y,
            midpoint.z + textOffset.z,
          ]}
          center={false}
          distanceFactor={10}
          style={{
            background: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            minWidth: "120px",
            wordWrap: "break-word",
            border: `2px solid ${line.color}`,
            transform: "scale(1)",
            transformOrigin: "center center",
            pointerEvents: "auto",
            position: "relative",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-4px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "0",
              height: "0",
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderRight: `4px solid ${line.color}`,
            }}
          />
          {isEditing ? (
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: "30px",
                  background: "white",
                  color: "black",
                  border: "none",
                  borderRadius: "2px",
                  padding: "2px",
                  fontSize: "9px",
                  resize: "vertical",
                }}
                placeholder="Enter line description..."
              />
              <div
                style={{
                  marginTop: "4px",
                  display: "flex",
                  gap: "4px",
                }}
              >
                <button
                  onClick={handleSave}
                  style={{
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "1px 4px",
                    borderRadius: "2px",
                    fontSize: "8px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "1px 4px",
                    borderRadius: "2px",
                    fontSize: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: "4px" }}>
                {text || "Click to add description"}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "#FF9800",
                    color: "white",
                    border: "none",
                    padding: "1px 3px",
                    borderRadius: "2px",
                    fontSize: "7px",
                    cursor: "pointer",
                  }}
                >
                  Edit Text
                </button>
                <button
                  onClick={() => onRemove(line.id)}
                  style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "1px 3px",
                    borderRadius: "2px",
                    fontSize: "7px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </Html>
      )}
    </group>
  );
};

export default LineComponent;
