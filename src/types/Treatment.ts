export interface Treatment {
  id: string;
  area: string;
  treatment: string;
  dosage: string;
  date: string;
  cost: number;
  color: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  notes?: string;
}

export interface Pin {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  treatment?: Treatment;
  comment: string;
}

export interface Line {
  id: string;
  startPoint: {
    x: number;
    y: number;
    z: number;
  };
  endPoint: {
    x: number;
    y: number;
    z: number;
  };
  points: {
    x: number;
    y: number;
    z: number;
  }[];
  text: string;
  color: string;
  isStraightLine?: boolean; // Flag to indicate if this is a straight line
}
