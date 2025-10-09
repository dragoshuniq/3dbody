import React from "react";
import { useBodyStore } from "../store/useBodyStore";
import {
  FaMapMarkerAlt,
  FaEye,
  FaUser,
  FaRunning,
  FaSearchPlus,
} from "react-icons/fa";
import dayjs from "dayjs";

interface PinListProps {
  onZoomToPin: (pinId: string) => void;
}

const PinList: React.FC<PinListProps> = ({ onZoomToPin }) => {
  const { pins, selectedPinId, setSelectedPin } = useBodyStore();

  const getAreaIcon = (area: string) => {
    switch (area.toLowerCase()) {
      case "face":
        return <FaEye size={16} />;
      case "chest":
        return <FaUser size={16} />;
      case "legs":
        return <FaRunning size={16} />;
      default:
        return <FaMapMarkerAlt size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  return (
    <div
      style={{
        width: "250px",
        height: "100vh",
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "20px",
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FaMapMarkerAlt />
        Treatment Pins ({pins.length})
      </h2>

      {pins.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#ccc",
            fontSize: "14px",
            padding: "20px",
          }}
        >
          No pins available
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {pins.map((pin) => (
            <div
              key={pin.id}
              onClick={() => {
                setSelectedPin(
                  pin.id === selectedPinId ? null : pin.id
                );
                onZoomToPin(pin.id);
              }}
              style={{
                background:
                  pin.id === selectedPinId
                    ? "rgba(139, 92, 246, 0.3)"
                    : "rgba(255,255,255,0.1)",
                border:
                  pin.id === selectedPinId
                    ? "2px solid #8B5CF6"
                    : "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                padding: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (pin.id !== selectedPinId) {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (pin.id !== selectedPinId) {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.1)";
                }
              }}
            >
              {/* Pin indicator */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: pin.treatment?.color || "#f44336",
                  border: "2px solid white",
                }}
              />

              {/* Area and icon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {getAreaIcon(pin.treatment?.area || "Unknown")}
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: pin.treatment?.color || "#f44336",
                  }}
                >
                  {pin.treatment?.area || "Unknown Area"}
                </span>
              </div>

              {/* Treatment details */}
              {pin.treatment && (
                <div style={{ marginBottom: "8px" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      marginBottom: "4px",
                    }}
                  >
                    {pin.treatment.treatment}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#ccc",
                      marginBottom: "2px",
                    }}
                  >
                    Dosage: {pin.treatment.dosage}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#ccc",
                      marginBottom: "2px",
                    }}
                  >
                    Date: {formatDate(pin.treatment.date)}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#4CAF50",
                      fontWeight: "500",
                    }}
                  >
                    Cost: ${pin.treatment.cost}
                  </div>
                </div>
              )}

              {/* Position coordinates */}
              <div
                style={{
                  fontSize: "10px",
                  color: "#aaa",
                  marginBottom: "8px",
                  fontFamily: "monospace",
                }}
              >
                Position: ({pin.position.x.toFixed(3)},{" "}
                {pin.position.y.toFixed(3)},{" "}
                {pin.position.z.toFixed(3)})
              </div>

              {/* Notes */}
              {pin.treatment?.notes && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#ddd",
                    fontStyle: "italic",
                    marginTop: "8px",
                    padding: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                  }}
                >
                  {pin.treatment.notes}
                </div>
              )}

              {/* Comment */}
              {pin.comment && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#bbb",
                    marginTop: "8px",
                    padding: "8px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                    borderLeft: "3px solid #2196F3",
                  }}
                >
                  <strong>Comment:</strong> {pin.comment}
                </div>
              )}

              {/* Click instruction */}
              <div
                style={{
                  fontSize: "10px",
                  color: "#666",
                  marginTop: "8px",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                <FaSearchPlus size={10} />
                {pin.id === selectedPinId
                  ? "Click to deselect"
                  : "Click to zoom & select"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PinList;
