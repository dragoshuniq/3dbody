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
