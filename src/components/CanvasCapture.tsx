import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useThree } from "@react-three/fiber";

export interface CanvasCaptureRef {
  captureCanvas: () => Promise<string>;
}

const CanvasCapture = forwardRef<CanvasCaptureRef>((props, ref) => {
  const { gl, scene, camera } = useThree();

  const captureCanvas = async (): Promise<string> => {
    return new Promise((resolve) => {
      gl.render(scene, camera);

      const canvas = gl.domElement;

      const captureCanvas = document.createElement("canvas");
      const ctx = captureCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get 2D context");
      }

      captureCanvas.width = canvas.width;
      captureCanvas.height = canvas.height;

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);

      ctx.drawImage(canvas, 0, 0);

      const dataURL = captureCanvas.toDataURL("image/png", 1.0);
      resolve(dataURL);
    });
  };

  useImperativeHandle(ref, () => ({
    captureCanvas,
  }));

  return null;
});

CanvasCapture.displayName = "CanvasCapture";

export default CanvasCapture;
