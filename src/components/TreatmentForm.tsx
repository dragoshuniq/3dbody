import React, { useState } from "react";
import { Vector3 } from "three";
import { FaTimes, FaSave, FaMapMarkerAlt } from "react-icons/fa";
import type { Treatment } from "../types/Treatment";
import dayjs from "dayjs";

interface TreatmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatment: Treatment) => void;
  pinPosition: Vector3;
  pinId: string;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  pinPosition,
  pinId,
}) => {
  const [formData, setFormData] = useState({
    area: "",
    treatment: "",
    dosage: "",
    date: dayjs().format("YYYY-MM-DD"),
    cost: 0,
    color: "#8B5CF6", // Default purple color
    notes: "",
  });

  const treatmentOptions = [
    "Botox Cosmetic",
    "Juvederm Voluma",
    "Juvederm Volift",
    "Juvederm Ultra",
    "Restylane",
    "Sculptra",
    "Radiesse",
    "Belotero",
    "Other",
  ];

  const areaOptions = [
    "Forehead",
    "Glabella",
    "Crows Feet",
    "Cheeks",
    "Chin",
    "Lip",
    "Nasolabial Folds",
    "Marionette Lines",
    "Jawline",
    "Neck",
    "Other",
  ];

  const colorOptions = [
    { name: "Botox (Purple)", value: "#8B5CF6" },
    { name: "Juvederm (Orange)", value: "#F59E0B" },
    { name: "Restylane (Blue)", value: "#3B82F6" },
    { name: "Sculptra (Green)", value: "#10B981" },
    { name: "Radiesse (Red)", value: "#EF4444" },
    { name: "Belotero (Pink)", value: "#EC4899" },
    { name: "Custom", value: "#6B7280" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cost" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const treatment: Treatment = {
      id: pinId,
      area: formData.area,
      treatment: formData.treatment,
      dosage: formData.dosage,
      date: formData.date,
      cost: formData.cost,
      color: formData.color,
      position: {
        x: pinPosition.x,
        y: pinPosition.y,
        z: pinPosition.z,
      },
      notes: formData.notes,
    };

    onSave(treatment);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      area: "",
      treatment: "",
      dosage: "",
      date: dayjs().format("YYYY-MM-DD"),
      cost: 0,
      color: "#8B5CF6",
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "600",
              color: "#1F2937",
            }}
          >
            <FaMapMarkerAlt
              style={{ marginRight: "8px", color: "#8B5CF6" }}
            />
            Treatment Details
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#6B7280",
              padding: "4px",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "16px" }}>
            {/* Area */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Treatment Area *
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="">Select area...</option>
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Treatment */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Treatment Type *
              </label>
              <select
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="">Select treatment...</option>
                {treatmentOptions.map((treatment) => (
                  <option key={treatment} value={treatment}>
                    {treatment}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosage */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Dosage *
              </label>
              <input
                type="text"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="e.g., 10 U, 1 mL, 0.5 mL"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Date */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Treatment Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Cost */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Cost ($) *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            {/* Color */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Pin Color
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "8px",
                }}
              >
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange(color.value)}
                    style={{
                      padding: "8px 12px",
                      border: `2px solid ${
                        formData.color === color.value
                          ? color.value
                          : "#E5E7EB"
                      }`,
                      borderRadius: "6px",
                      backgroundColor:
                        formData.color === color.value
                          ? color.value
                          : "white",
                      color:
                        formData.color === color.value
                          ? "white"
                          : "#374151",
                      fontSize: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about the treatment..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #D1D5DB",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#374151",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#8B5CF6",
                color: "white",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <FaSave />
              Save Treatment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatmentForm;
