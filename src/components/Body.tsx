import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, useFBX, Html } from "@react-three/drei";
import { Group, Vector3 } from "three";
import * as THREE from "three";
import { type Pin, type Treatment } from "../types/Treatment";
import TreatmentForm from "./TreatmentForm";
import { useBodyStore } from "../store/useBodyStore";
import dayjs from "dayjs";

interface BodyProps {
  pins: Pin[];
  onAddPin: (pin: Pin) => void;
  onUpdatePin: (id: string, comment: string) => void;
  onRemovePin: (id: string) => void;
  onUpdateTreatment: (id: string, treatment: Treatment) => void;
  isAddingPin: boolean;
}

export interface BodyRef {
  zoomToPosition: (
    position: Vector3,
    target: Vector3,
    distance?: number
  ) => void;
  zoomToPin: (pinId: string) => void;
  resetCamera: () => void;
}

const PinComponent: React.FC<{
  pin: Pin;
  onUpdateComment: (id: string, comment: string) => void;
  onRemove: (id: string) => void;
  onUpdateTreatment: (id: string, treatment: Treatment) => void;
}> = ({ pin, onUpdateComment, onRemove, onUpdateTreatment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(pin.comment);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const { selectedPinId, setSelectedPin } = useBodyStore();

  const isSelected = selectedPinId === pin.id;

  const handleSave = () => {
    onUpdateComment(pin.id, comment);
    setIsEditing(false);
  };

  const handleSaveTreatment = (treatment: Treatment) => {
    onUpdateTreatment(pin.id, treatment);
    setShowTreatmentForm(false);
  };

  const pinPosition = new Vector3(
    pin.position.x,
    pin.position.y,
    pin.position.z
  );

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPin(isSelected ? null : pin.id);
  };

  return (
    <group position={pinPosition}>
      {/* Pin sphere with treatment color */}
      <mesh onClick={handlePinClick}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial
          color={pin.treatment?.color || "red"}
          emissive={
            isSelected ? pin.treatment?.color || "red" : "#000000"
          }
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Pin label with comment - only show when selected */}
      {isSelected && (
        <Html
          position={[0.02, 0.02, 0]}
          center={false}
          occlude
          style={{
            background: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "6px 8px",
            borderRadius: "3px",
            fontSize: "10px",
            width: "100px",
            wordWrap: "break-word",
            border: `1px solid ${pin.treatment?.color || "red"}`,
            transform: "scale(1)",
            transformOrigin: "left center",
            pointerEvents: "auto",
            position: "relative",
          }}
        >
          {/* Arrow pointer to pin */}
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
              borderRight: `4px solid ${
                pin.treatment?.color || "red"
              }`,
            }}
          />
          {isEditing ? (
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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
                  onClick={() => {
                    setComment(pin.comment);
                    setIsEditing(false);
                  }}
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
              {pin.treatment ? (
                <div style={{ marginBottom: "4px" }}>
                  <div
                    style={{ fontWeight: "bold", fontSize: "9px" }}
                  >
                    {pin.treatment.area}
                  </div>
                  <div style={{ fontSize: "8px", color: "#ccc" }}>
                    {pin.treatment.treatment} - {pin.treatment.dosage}
                  </div>
                  <div style={{ fontSize: "8px", color: "#ccc" }}>
                    ${pin.treatment.cost} -{" "}
                    {dayjs(pin.treatment.date).format("MMM DD, YYYY")}
                  </div>
                  {pin.treatment.notes && (
                    <div
                      style={{
                        fontSize: "7px",
                        color: "#aaa",
                        marginTop: "2px",
                      }}
                    >
                      {pin.treatment.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: "4px" }}>
                  {pin.comment || "Click to add treatment"}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  flexWrap: "wrap",
                }}
              >
                {!pin.treatment && (
                  <button
                    onClick={() => setShowTreatmentForm(true)}
                    style={{
                      background: "#8B5CF6",
                      color: "white",
                      border: "none",
                      padding: "1px 3px",
                      borderRadius: "2px",
                      fontSize: "7px",
                      cursor: "pointer",
                    }}
                  >
                    Add Treatment
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: "#2196F3",
                    color: "white",
                    border: "none",
                    padding: "1px 3px",
                    borderRadius: "2px",
                    fontSize: "7px",
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

      {/* Treatment Form */}
      <TreatmentForm
        isOpen={showTreatmentForm}
        onClose={() => setShowTreatmentForm(false)}
        onSave={handleSaveTreatment}
        pinPosition={pinPosition}
        pinId={pin.id}
      />
    </group>
  );
};

const Body = forwardRef<BodyRef, BodyProps>(
  (
    {
      pins,
      onAddPin,
      onUpdatePin,
      onRemovePin,
      onUpdateTreatment,
      isAddingPin,
    },
    ref
  ) => {
    const groupRef = useRef<Group>(null);
    const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const fbx = useFBX("/dude.fbx");
    const { camera, raycaster, mouse } = useThree();
    const { updateCameraPosition, updateCameraTarget } =
      useBodyStore();

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
            position: {
              x: point.x,
              y: point.y,
              z: point.z,
            },
            comment: "",
          };
          onAddPin(newPin);
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

    // Expose camera control functions
    useImperativeHandle(
      ref,
      () => ({
        zoomToPosition: (
          position: Vector3,
          target: Vector3,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _distance: number = 2
        ) => {
          if (controlsRef.current) {
            // Animate camera to new position
            const startPosition = camera.position.clone();
            const startTarget = controlsRef.current.target.clone();

            // Create animation
            const animate = (progress: number) => {
              camera.position.lerpVectors(
                startPosition,
                position,
                progress
              );
              controlsRef.current.target.lerpVectors(
                startTarget,
                target,
                progress
              );
              controlsRef.current.update();
            };

            // Simple animation loop
            let startTime: number;
            const duration = 1000; // 1 second

            const animationLoop = (currentTime: number) => {
              if (!startTime) startTime = currentTime;
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              animate(progress);

              if (progress < 1) {
                requestAnimationFrame(animationLoop);
              }
            };

            requestAnimationFrame(animationLoop);
          }
        },
        zoomToPin: (pinId: string) => {
          const pin = pins.find((p) => p.id === pinId);
          if (pin && controlsRef.current) {
            const pinPosition = new Vector3(
              pin.position.x,
              pin.position.y,
              pin.position.z
            );
            // Calculate camera position slightly offset from the pin
            const cameraOffset = new Vector3(0.3, 0.2, 0.3);
            const cameraPosition = pinPosition
              .clone()
              .add(cameraOffset);

            // Animate camera to pin position
            const startPosition = camera.position.clone();
            const startTarget = controlsRef.current.target.clone();
            const duration = 1000; // 1 second
            const startTime = performance.now();

            const animate = (progress: number) => {
              camera.position.lerpVectors(
                startPosition,
                cameraPosition,
                progress
              );
              controlsRef.current!.target.lerpVectors(
                startTarget,
                pinPosition,
                progress
              );
              controlsRef.current!.update();
            };

            const animationLoop = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              animate(progress);

              if (progress < 1) {
                requestAnimationFrame(animationLoop);
              }
            };

            requestAnimationFrame(animationLoop);
          }
        },
        resetCamera: () => {
          if (controlsRef.current) {
            camera.position.set(0, 0, 5);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }
        },
      }),
      [camera, pins]
    );

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
            onUpdateTreatment={onUpdateTreatment}
          />
        ))}

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
          onChange={() => {
            if (controlsRef.current) {
              const position = camera.position;
              const target = controlsRef.current.target;
              updateCameraPosition({
                x: position.x,
                y: position.y,
                z: position.z,
              });
              updateCameraTarget({
                x: target.x,
                y: target.y,
                z: target.z,
              });
            }
          }}
        />
      </>
    );
  }
);

Body.displayName = "Body";

export default Body;
