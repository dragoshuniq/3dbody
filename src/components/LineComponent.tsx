import React, { useRef } from "react";
import { Vector3 } from "three";
import * as THREE from "three";

export const BackFaceCullingLine: React.FC<{
  points: Vector3[];
  color: string;
  lineWidth?: number;
}> = ({ points, color, lineWidth = 3 }) => {
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
