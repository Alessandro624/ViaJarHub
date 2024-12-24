export interface Travel {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  oldPrice: number;
  price: number;
  maxParticipantsNumber: number;
  travelType: string;
  numeroStelle: number;
  immagini: File[];
  latitude: number;
  longitude: number;
}
