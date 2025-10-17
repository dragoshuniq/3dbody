import React, { useRef } from "react";
import { Vector3 } from "three";
import * as THREE from "three";

export const BackFaceCullingLine: React.FC<{
  points: Vector3[];
  color: string;
  lineWidth?: number;
}> = React.memo(({ points, color, lineWidth = 3 }) => {
  const lineRef = useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    if (lineRef.current && points.length >= 2) {
      // Create a tube geometry along the line path
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(
        curve,
        points.length * 2,
        lineWidth / 100,
        8,
        false
      );

      // Create material with back-face culling
      const material = createBackFaceCullingLineMaterial(color);

      lineRef.current.geometry = geometry;
      lineRef.current.material = material;
    }
  }, [points, color, lineWidth]);

  return <mesh ref={lineRef} />;
});

export const StraightLine: React.FC<{
  startPoint: Vector3;
  endPoint: Vector3;
  color: string;
  lineWidth?: number;
  bodyMesh?: THREE.Object3D; // Add body mesh for surface following
}> = React.memo(
  ({ startPoint, endPoint, color, lineWidth = 3, bodyMesh }) => {
    const lineRef = useRef<THREE.Mesh>(null);
    const curveRef = useRef<THREE.Curve<Vector3> | null>(null);
    const lastParamsRef = useRef<string>("");

    React.useEffect(() => {
      if (lineRef.current) {
        // Create a cache key based on start/end points
        const cacheKey = `${startPoint.x.toFixed(
          3
        )},${startPoint.y.toFixed(3)},${startPoint.z.toFixed(
          3
        )}-${endPoint.x.toFixed(3)},${endPoint.y.toFixed(
          3
        )},${endPoint.z.toFixed(3)}`;

        let curve: THREE.Curve<Vector3>;

        // Use cached curve if start/end points haven't changed
        if (curveRef.current && lastParamsRef.current === cacheKey) {
          curve = curveRef.current;
        } else {
          // Create curve that follows body surface
          if (bodyMesh) {
            curve = createSurfaceFollowingCurve(
              startPoint,
              endPoint,
              bodyMesh
            );
          } else {
            // Fallback to straight line
            curve = new THREE.LineCurve3(startPoint, endPoint);
          }
          curveRef.current = curve;
          lastParamsRef.current = cacheKey;
        }

        const geometry = new THREE.TubeGeometry(
          curve,
          64, // More segments for smoother line
          lineWidth / 100,
          8,
          false
        );

        // Create material with back-face culling
        const material = createBackFaceCullingLineMaterial(color);

        lineRef.current.geometry = geometry;
        lineRef.current.material = material;
      }
    }, [startPoint, endPoint, color, lineWidth]); // eslint-disable-line react-hooks/exhaustive-deps

    return <mesh ref={lineRef} />;
  }
);

// Function to create a curve that follows the body surface
const createSurfaceFollowingCurve = (
  startPoint: Vector3,
  endPoint: Vector3,
  bodyMesh: THREE.Object3D
): THREE.Curve<Vector3> => {
  const points: Vector3[] = [];
  const numSegments = 32; // Number of points along the curve

  // Create a raycaster for surface intersection
  const raycaster = new THREE.Raycaster();

  // Get the direction vector from start to end
  const direction = endPoint.clone().sub(startPoint);
  const distance = direction.length();
  direction.normalize();

  // Get body bounding box to determine ray directions
  const bodyBox = new THREE.Box3().setFromObject(bodyMesh);
  const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
  const bodySize = bodyBox.getSize(new THREE.Vector3());
  const bodyRadius =
    Math.max(bodySize.x, bodySize.y, bodySize.z) * 0.6;

  // Sample points along the straight line and project them onto the body surface
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const straightPoint = startPoint
      .clone()
      .add(direction.clone().multiplyScalar(distance * t));

    // Create multiple rays in different directions to find the best surface intersection
    const rayDirections = [
      // Ray towards body center
      bodyCenter.clone().sub(straightPoint).normalize(),
      // Ray perpendicular to the line direction
      new THREE.Vector3(-direction.y, direction.x, 0).normalize(),
      // Ray in opposite perpendicular direction
      new THREE.Vector3(direction.y, -direction.x, 0).normalize(),
      // Ray with slight Z offset
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];

    let bestIntersection: THREE.Vector3 | null = null;
    let minDistance = Infinity;

    // Try each ray direction
    for (const rayDirection of rayDirections) {
      raycaster.set(straightPoint, rayDirection);
      const intersects = raycaster.intersectObject(bodyMesh, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const distanceToIntersection = intersection.distance;

        // Choose the closest intersection
        if (distanceToIntersection < minDistance) {
          minDistance = distanceToIntersection;
          bestIntersection = intersection.point.clone();

          // Offset slightly outward from the surface
          const normal = intersection.face?.normal;
          if (normal) {
            bestIntersection.add(normal.clone().multiplyScalar(0.01));
          }
        }
      }
    }

    // If we found a good intersection, use it; otherwise use the straight point
    if (bestIntersection) {
      points.push(bestIntersection);
    } else {
      // Fallback: project onto a sphere around the body
      const sphere = new THREE.Sphere(bodyCenter, bodyRadius);
      const sphereIntersection = new THREE.Vector3();
      const ray = new THREE.Ray(
        straightPoint,
        bodyCenter.clone().sub(straightPoint).normalize()
      );

      if (ray.intersectSphere(sphere, sphereIntersection)) {
        points.push(sphereIntersection);
      } else {
        points.push(straightPoint);
      }
    }
  }

  // Create a smooth curve through the surface points
  return new THREE.CatmullRomCurve3(points);
};

const createBackFaceCullingLineMaterial = (color: string) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.FrontSide, // Only render front faces
    transparent: true,
    opacity: 0.8,
  });
};
