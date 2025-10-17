import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Group, Vector3 } from "three";
import * as THREE from "three";
import { type Pin, type Line as LineType } from "../types/Treatment";
import { useBodyStore } from "../store/useBodyStore";
import dayjs from "dayjs";
import { BackFaceCullingLine } from "./LineComponent";

interface BodyProps {
  pins: Pin[];
  lines: LineType[];
  onAddPin: (pin: Pin) => void;
  onUpdatePin: (id: string, comment: string) => void;
  onRemovePin: (id: string) => void;
  onAddLine: (line: LineType) => void;
  onUpdateLine: (id: string, text: string) => void;
  onRemoveLine: (id: string) => void;
  isAddingPin: boolean;
  isDrawingLine: boolean;
  onOpenTreatmentForm: (pinId: string) => void;
  treatmentFormOpen: boolean;
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
  onOpenTreatmentForm: (pinId: string) => void;
  treatmentFormOpen: boolean;
}> = ({
  pin,
  onUpdateComment,
  onRemove,
  onOpenTreatmentForm,
  treatmentFormOpen,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(pin.comment);

  React.useEffect(() => {
    if (!pin.treatment && pin.comment === "") {
      onOpenTreatmentForm(pin.id);
    }
  }, [pin.treatment, pin.comment, pin.id, onOpenTreatmentForm]);
  const { selectedPinId, setSelectedPin } = useBodyStore();

  const isSelected = selectedPinId === pin.id;

  React.useEffect(() => {
    console.log(`Pin ${pin.id} selection state:`, {
      isSelected,
      selectedPinId,
    });
  }, [isSelected, selectedPinId, pin.id]);

  const handleSave = () => {
    onUpdateComment(pin.id, comment);
    setIsEditing(false);
  };

  const pinPosition = new Vector3(
    pin.position.x,
    pin.position.y,
    pin.position.z
  );

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(
      "Pin clicked:",
      pin.id,
      "Currently selected:",
      isSelected
    );
    setSelectedPin(isSelected ? null : pin.id);
  };

  return (
    <group position={pinPosition}>
      <mesh onClick={handlePinClick}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={pin.treatment?.color || "red"}
          emissive={
            isSelected ? pin.treatment?.color || "red" : "#000000"
          }
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {isSelected && !treatmentFormOpen && (
        <Html
          position={[0.3, 0.55, 0]}
          center={false}
          distanceFactor={10}
          style={{
            background: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            width: "150px",
            wordWrap: "break-word",
            border: `2px solid ${pin.treatment?.color || "red"}`,
            transform: "scale(1)",
            transformOrigin: "left center",
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
                    onClick={() => onOpenTreatmentForm(pin.id)}
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
                  onClick={() => onOpenTreatmentForm(pin.id)}
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
                  Edit Treatment
                </button>
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
                  Edit Comment
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
    </group>
  );
};

const Body = forwardRef<BodyRef, BodyProps>(
  (
    {
      pins,
      lines,
      onAddPin,
      onUpdatePin,
      onRemovePin,
      onAddLine,
      isAddingPin,
      isDrawingLine,
      onOpenTreatmentForm,
      treatmentFormOpen,
    },
    ref
  ) => {
    const groupRef = useRef<Group>(null);
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const gltf = useGLTF("/buhai.glb");
    const dude = gltf.scene;
    const { camera, raycaster, pointer } = useThree();
    const {
      updateCameraPosition,
      updateCameraTarget,
      setLineDrawingState,
      orbitControlsEnabled,
    } = useBodyStore();

    const [currentLine, setCurrentLine] = useState<Vector3[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Reset line drawing state when drawing mode is disabled
    React.useEffect(() => {
      if (!isDrawingLine) {
        setCurrentLine([]);
        setIsDrawing(false);
        setLineDrawingState("idle");
      }
    }, [isDrawingLine, setLineDrawingState]);

    // Helper function to get intersection point on body surface
    const getSurfaceIntersection = useCallback(
      (event: MouseEvent) => {
        if (!dude) return null;

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        let intersects: THREE.Intersection[] = [];

        intersects = raycaster.intersectObject(dude, true);

        if (intersects.length === 0) {
          intersects = raycaster.intersectObjects(
            dude.children,
            true
          );
        }

        if (intersects.length === 0) {
          const allMeshes: THREE.Mesh[] = [];
          dude.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              allMeshes.push(child);
            }
          });
          intersects = raycaster.intersectObjects(allMeshes, true);
        }

        if (intersects.length > 0) {
          const { point, face } = intersects[0];
          // Move point a tiny bit along the face normal to avoid z-fighting
          const offsetPoint = point
            .clone()
            .add(
              face?.normal?.clone().multiplyScalar(0.01) ||
                new THREE.Vector3()
            );
          return offsetPoint;
        }

        // If no intersection found, project onto a sphere around the body
        const bodyBox = new THREE.Box3().setFromObject(dude);
        const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
        const bodySize = bodyBox.getSize(new THREE.Vector3());
        const bodyRadius =
          Math.max(bodySize.x, bodySize.y, bodySize.z) * 0.6;

        const ray = raycaster.ray;
        const sphere = new THREE.Sphere(bodyCenter, bodyRadius);

        const intersectionPoint = new THREE.Vector3();
        const result = ray.intersectSphere(sphere, intersectionPoint);

        if (result) {
          console.log("Projected onto sphere:", intersectionPoint);
          return intersectionPoint;
        }

        // Fallback: project onto a plane at body center
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        plane.translate(bodyCenter);

        const planeIntersection = new THREE.Vector3();
        ray.intersectPlane(plane, planeIntersection);

        if (planeIntersection) {
          console.log("Projected onto plane:", planeIntersection);
          return planeIntersection;
        }

        return null;
      },
      [dude, pointer, raycaster, camera]
    );

    const handlePointerDown = useCallback(
      (event: MouseEvent) => {
        if (!isDrawingLine || !dude) return;
        event.stopPropagation();
        setIsDrawing(true);
        setCurrentLine([]);
      },
      [isDrawingLine, dude]
    );

    const handlePointerUp = useCallback(
      (event: MouseEvent) => {
        if (!isDrawingLine) return;
        event.stopPropagation();

        if (currentLine.length >= 2) {
          const newLine: LineType = {
            id: Date.now().toString(),
            startPoint: {
              x: currentLine[0].x,
              y: currentLine[0].y,
              z: currentLine[0].z,
            },
            endPoint: {
              x: currentLine[currentLine.length - 1].x,
              y: currentLine[currentLine.length - 1].y,
              z: currentLine[currentLine.length - 1].z,
            },
            points: currentLine.map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
            })),
            text: "",
            color: "#FF6B6B",
          };
          console.log("Adding new line:", newLine);
          onAddLine(newLine);
        }

        setIsDrawing(false);
        setCurrentLine([]);
      },
      [isDrawingLine, currentLine, onAddLine]
    );

    const handlePointerMove = useCallback(
      (event: MouseEvent) => {
        if (!isDrawingLine || !isDrawing || !dude) return;

        const intersectionPoint = getSurfaceIntersection(event);
        if (intersectionPoint) {
          // Store in world coordinates to avoid precision issues
          setCurrentLine((prev) => [
            ...prev,
            intersectionPoint.clone(),
          ]);
        }
      },
      [isDrawingLine, isDrawing, getSurfaceIntersection, dude]
    );

    const handleClick = useCallback(
      (event: MouseEvent) => {
        if (!isAddingPin || !dude) return;

        event.stopPropagation();

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        let intersects: THREE.Intersection[] = [];

        intersects = raycaster.intersectObject(dude, true);
        console.log("Main FBX intersects:", intersects.length);

        if (intersects.length === 0) {
          intersects = raycaster.intersectObjects(
            dude.children,
            true
          );
          console.log("Children intersects:", intersects.length);
        }

        if (intersects.length === 0) {
          const allMeshes: THREE.Mesh[] = [];
          dude.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              allMeshes.push(child);
              console.log("Mesh details:", {
                name: child.name,
                visible: child.visible,
                position: child.position,
                scale: child.scale,
                geometry: child.geometry,
                material: child.material,
              });
            }
          });
          console.log("Found meshes:", allMeshes.length);
          intersects = raycaster.intersectObjects(allMeshes, true);
          console.log("Meshes intersects:", intersects.length);

          console.log("Ray origin:", raycaster.ray.origin);
          console.log("Ray direction:", raycaster.ray.direction);
          console.log("Pointer position:", pointer);
        }

        if (intersects.length > 0) {
          const point = intersects[0].point;
          console.log("Pin added at:", point);
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
        } else {
          console.log("No intersection found - raycasting failed");
          console.log("FBX position:", dude.position);
          console.log("FBX scale:", dude.scale);
          console.log(
            "FBX bounding box:",
            new THREE.Box3().setFromObject(dude)
          );
        }
      },
      [isAddingPin, pointer, raycaster, camera, dude, onAddPin]
    );

    React.useEffect(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.addEventListener("click", handleClick);
        canvas.addEventListener("mousedown", handlePointerDown);
        canvas.addEventListener("mouseup", handlePointerUp);
        canvas.addEventListener("mousemove", handlePointerMove);
        return () => {
          canvas.removeEventListener("click", handleClick);
          canvas.removeEventListener("mousedown", handlePointerDown);
          canvas.removeEventListener("mouseup", handlePointerUp);
          canvas.removeEventListener("mousemove", handlePointerMove);
        };
      }
    }, [
      handleClick,
      handlePointerDown,
      handlePointerUp,
      handlePointerMove,
    ]);

    React.useEffect(() => {
      if (dude) {
        console.log("GLB loaded, current scale:", dude.scale);

        dude.scale.setScalar(0.5);
        console.log("GLB scale set to:", dude.scale);

        const box = new THREE.Box3().setFromObject(dude);
        const center = box.getCenter(new THREE.Vector3());
        dude.position.sub(center);
        console.log("GLB centered at:", dude.position);

        dude.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.visible = true;
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.geometry) {
              child.geometry.computeBoundingBox();
              child.geometry.computeBoundingSphere();

              if (!child.geometry.attributes.position) {
                console.warn(
                  "Mesh has no position attribute:",
                  child.name
                );
              }

              child.updateMatrix();
              child.updateMatrixWorld(true);
            }

            if (child.material) {
              child.material.side = THREE.DoubleSide; // Make sure both sides are raycastable
            }
          }
        });

        dude.updateMatrix();
        dude.updateMatrixWorld(true);

        console.log("GLB model loaded and prepared for raycasting");
        console.log("Final GLB scale:", dude.scale);
        console.log("Final GLB position:", dude.position);
      }
    }, [dude]);

    useImperativeHandle(
      ref,
      () => ({
        zoomToPosition: (position: Vector3, target: Vector3) => {
          if (controlsRef.current) {
            const startPosition = camera.position.clone();
            const startTarget = controlsRef.current.target.clone();

            const animate = (progress: number) => {
              camera.position.lerpVectors(
                startPosition,
                position,
                progress
              );
              controlsRef.current!.target.lerpVectors(
                startTarget,
                target,
                progress
              );
              controlsRef.current!.update();
            };

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

            const distance = 8; // Distance from pin (increased for zoom out)
            const height = 3; // Height above pin (increased for better overview)

            const cameraZ =
              pinPosition.z > 0
                ? pinPosition.z + distance // Front of body - camera in front
                : pinPosition.z - distance; // Back of body - camera behind

            const cameraPosition = new Vector3(
              pinPosition.x, // Keep same X position
              pinPosition.y + height, // Elevate camera
              cameraZ // Position based on body orientation
            );

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
        <primitive object={dude} ref={groupRef} />

        {pins.map((pin) => (
          <PinComponent
            key={pin.id}
            pin={pin}
            onUpdateComment={onUpdatePin}
            onRemove={onRemovePin}
            onOpenTreatmentForm={onOpenTreatmentForm}
            treatmentFormOpen={treatmentFormOpen}
          />
        ))}

        {lines.map((line) => {
          console.log("Rendering line:", line);
          // Handle both old lines (without points) and new lines (with points)
          const points = line.points
            ? line.points.map((point) => {
                // Points are now stored in world coordinates, use them directly
                return new Vector3(point.x, point.y, point.z);
              })
            : [
                new Vector3(
                  line.startPoint.x,
                  line.startPoint.y,
                  line.startPoint.z
                ),
                new Vector3(
                  line.endPoint.x,
                  line.endPoint.y,
                  line.endPoint.z
                ),
              ];
          return (
            <BackFaceCullingLine
              key={line.id}
              points={points}
              color={line.color}
              lineWidth={3}
            />
          );
        })}

        {/* Current drawing line preview */}
        {currentLine.length > 0 && (
          <BackFaceCullingLine
            points={currentLine}
            color="#00FF00"
            lineWidth={2}
          />
        )}

        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        <OrbitControls
          ref={controlsRef}
          enablePan={orbitControlsEnabled}
          enableZoom={orbitControlsEnabled}
          enableRotate={orbitControlsEnabled}
          minDistance={0.5}
          maxDistance={200}
          maxPolarAngle={Math.PI}
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
