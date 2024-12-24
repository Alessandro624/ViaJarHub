export interface Travel {
  id: number;
  destination: string;
  isCountry: boolean;
  startDate: string;
  endDate: string;
  description: string;
  oldPrice: number;
  price: number;
  maxParticipantsNumber: number;
  travelType: string;
  numeroStelle: number;
  latitude: number;
  longitude: number;
}
