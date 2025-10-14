import React, { useState } from "react";
import { useBodyStore } from "../store/useBodyStore";
import jsPDF from "jspdf";
import { FaPrint, FaSpinner } from "react-icons/fa";
import { type Pin } from "../types/Treatment";

interface PrintButtonProps {
  onZoomToPin: (pinId: string) => void;
  onCaptureCanvas: () => Promise<string>;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  onZoomToPin,
  onCaptureCanvas,
}) => {
  const { pins } = useBodyStore();
  const [isPrinting, setIsPrinting] = useState(false);
  const [progress, setProgress] = useState("");

  const capturePinZone = async (pinId: string): Promise<string> => {
    onZoomToPin(pinId);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await new Promise((resolve) => setTimeout(resolve, 500));

    const imageData = await onCaptureCanvas();

    console.log(
      `Captured image for pin ${pinId}, data length: ${imageData.length}`
    );

    return imageData;
  };

  const generatePDF = async (
    images: { pinId: string; imageData: string; pin: Pin }[]
  ) => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    pdf.setFontSize(20);
    pdf.text("3D Body Treatment Report", margin, margin + 10);
    pdf.setFontSize(12);
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      margin,
      margin + 20
    );
    pdf.text(
      `Total Treatment Areas: ${images.length}`,
      margin,
      margin + 30
    );

    let yPosition = margin + 50;
    pdf.setFontSize(10);
    pdf.text("Treatment Summary:", margin, yPosition);
    yPosition += 10;

    images.forEach((item, index) => {
      const pin = item.pin;
      if (pin.treatment) {
        pdf.text(
          `${index + 1}. ${pin.treatment.area} - ${
            pin.treatment.treatment
          }`,
          margin,
          yPosition
        );
        yPosition += 6;
        pdf.text(
          `   Dosage: ${pin.treatment.dosage} | Cost: $${pin.treatment.cost}`,
          margin,
          yPosition
        );
        yPosition += 6;
        pdf.text(
          `   Date: ${new Date(
            pin.treatment.date
          ).toLocaleDateString()}`,
          margin,
          yPosition
        );
        yPosition += 8;
      }
    });

    pdf.addPage();

    for (let i = 0; i < images.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const item = images[i];
      const pin = item.pin;

      pdf.setFontSize(14);
      pdf.text(
        `Treatment Area ${i + 1}: ${
          pin.treatment?.area || "Unknown Area"
        }`,
        margin,
        margin + 10
      );

      if (pin.treatment) {
        pdf.setFontSize(10);
        pdf.text(
          `Treatment: ${pin.treatment.treatment}`,
          margin,
          margin + 20
        );
        pdf.text(
          `Dosage: ${pin.treatment.dosage}`,
          margin,
          margin + 28
        );
        pdf.text(`Cost: $${pin.treatment.cost}`, margin, margin + 36);
        pdf.text(
          `Date: ${new Date(
            pin.treatment.date
          ).toLocaleDateString()}`,
          margin,
          margin + 44
        );

        if (pin.treatment.notes) {
          pdf.text(
            `Notes: ${pin.treatment.notes}`,
            margin,
            margin + 52
          );
        }
      }

      if (pin.comment) {
        pdf.text(
          `Comment: ${pin.comment}`,
          margin,
          margin + (pin.treatment?.notes ? 60 : 52)
        );
      }

      const imageStartY =
        margin + (pin.treatment?.notes || pin.comment ? 70 : 60);
      const availableHeight = pageHeight - imageStartY - margin;

      let imageWidth = contentWidth * 0.8;
      let imageHeight = imageWidth * (9 / 16);

      if (imageHeight > availableHeight) {
        const scaleFactor = availableHeight / imageHeight;
        imageWidth = imageWidth * scaleFactor;
        imageHeight = imageHeight * scaleFactor;
      }

      const imageX = margin + (contentWidth - imageWidth) / 2;

      console.log(
        `Adding image for pin ${item.pinId}, data length: ${item.imageData.length}`
      );
      pdf.addImage(
        item.imageData,
        "PNG",
        imageX,
        imageStartY,
        imageWidth,
        imageHeight
      );
    }

    return pdf;
  };

  const handlePrint = async () => {
    if (pins.length === 0) {
      alert("No pins to print");
      return;
    }

    setIsPrinting(true);

    try {
      console.log("Testing canvas capture...");
      const testImage = await onCaptureCanvas();
      console.log(
        "Test capture successful, data length:",
        testImage.length
      );
    } catch (error) {
      console.error("Test capture failed:", error);
      alert("Canvas capture failed. Please try again.");
      setIsPrinting(false);
      return;
    }

    try {
      const images: { pinId: string; imageData: string; pin: Pin }[] =
        [];

      for (let i = 0; i < pins.length; i++) {
        const pin = pins[i];
        setProgress(`Capturing ${i + 1}/${pins.length}...`);
        console.log(
          `Capturing pin ${i + 1}/${pins.length}: ${pin.id}...`
        );

        try {
          const imageData = await capturePinZone(pin.id);
          images.push({
            pinId: pin.id,
            imageData,
            pin,
          });
        } catch (error) {
          console.error(`Failed to capture pin ${pin.id}:`, error);
        }
      }

      setProgress("Generating PDF...");

      if (images.length === 0) {
        throw new Error("No images were captured successfully");
      }

      console.log("Generating PDF...");
      const pdf = await generatePDF(images);

      const fileName = `body3d-treatment-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      pdf.save(fileName);

      console.log(
        `PDF generated successfully with ${images.length} images`
      );
      alert(
        `PDF generated successfully! Captured ${images.length} treatment areas.`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        `Error generating PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`
      );
    } finally {
      setIsPrinting(false);
      setProgress("");
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={isPrinting || pins.length === 0}
      style={{
        background: isPrinting ? "#666" : "#4CAF50",
        color: "white",
        border: "none",
        padding: "10px 15px",
        borderRadius: "4px",
        cursor: isPrinting ? "not-allowed" : "pointer",
        fontSize: "14px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginTop: "10px",
      }}
    >
      {isPrinting ? (
        <>
          <FaSpinner className="fa-spin" />
          {progress || "Generating PDF..."}
        </>
      ) : (
        <>
          <FaPrint />
          Print All Pin Zones
        </>
      )}
    </button>
  );
};

export default PrintButton;
