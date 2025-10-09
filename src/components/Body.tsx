import React, { useRef, useState, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, useFBX, Html } from "@react-three/drei";
import { Group, Vector3 } from "three";
import * as THREE from "three";

interface Pin {
  id: string;
  position: Vector3;
  comment: string;
}

interface BodyProps {
  pins: Pin[];
  onAddPin: (pin: Pin) => void;
  onUpdatePin: (id: string, comment: string) => void;
  onRemovePin: (id: string) => void;
}

const PinComponent: React.FC<{
  pin: Pin;
  onUpdateComment: (id: string, comment: string) => void;
  onRemove: (id: string) => void;
}> = ({ pin, onUpdateComment, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(pin.comment);

  const handleSave = () => {
    onUpdateComment(pin.id, comment);
    setIsEditing(false);
  };

  return (
    <group position={pin.position}>
      {/* Red pin sphere */}
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Pin label with comment */}
      <Html
        position={[0, 0.3, 0]}
        center
        distanceFactor={10}
        occlude
        style={{
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          minWidth: "120px",
          maxWidth: "200px",
          wordWrap: "break-word",
        }}
      >
        {isEditing ? (
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                minHeight: "60px",
                background: "white",
                color: "black",
                border: "none",
                borderRadius: "2px",
                padding: "4px",
                fontSize: "12px",
                resize: "vertical",
              }}
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
                  padding: "2px 8px",
                  borderRadius: "2px",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setComment(pin.comment);
                  setIsEditing(false);
                }}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "2px 8px",
                  borderRadius: "2px",
                  fontSize: "10px",
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
              {pin.comment || "Click to add comment"}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "#2196F3",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => onRemove(pin.id)}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </Html>
    </group>
  );
};

const Body: React.FC<BodyProps> = ({
  pins,
  onAddPin,
  onUpdatePin,
  onRemovePin,
}) => {
  const groupRef = useRef<Group>(null);
  const fbx = useFBX("/dude.fbx");
  const { camera, raycaster, mouse } = useThree();
  const [isAddingPin, setIsAddingPin] = useState(false);

  // Handle mouse clicks to add pins
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!isAddingPin) return;

      event.stopPropagation();

      // Update mouse position
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Cast ray from camera through mouse position
      raycaster.setFromCamera(mouse, camera);

      // Find intersection with the FBX model
      const intersects = raycaster.intersectObject(fbx, true);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const newPin: Pin = {
          id: Date.now().toString(),
          position: point.clone(),
          comment: "",
        };
        onAddPin(newPin);
        setIsAddingPin(false);
      }
    },
    [isAddingPin, mouse, raycaster, camera, fbx, onAddPin]
  );

  // Add event listener for clicks
  React.useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("click", handleClick);
      return () => canvas.removeEventListener("click", handleClick);
    }
  }, [handleClick]);

  // Scale and position the FBX model appropriately
  React.useEffect(() => {
    if (fbx) {
      // Scale the model to a reasonable size
      fbx.scale.setScalar(0.01);
      // Center the model
      const box = new THREE.Box3().setFromObject(fbx);
      const center = box.getCenter(new THREE.Vector3());
      fbx.position.sub(center);
    }
  }, [fbx]);

  return (
    <>
      {/* FBX Model */}
      <primitive object={fbx} ref={groupRef} />

      {/* Pins */}
      {pins.map((pin) => (
        <PinComponent
          key={pin.id}
          pin={pin}
          onUpdateComment={onUpdatePin}
          onRemove={onRemovePin}
        />
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

export default Body;
