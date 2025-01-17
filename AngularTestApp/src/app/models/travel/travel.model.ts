import {TravelType} from './travel-type.enum';

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
  travelType: TravelType;
  latitude: number;
  longitude: number;
}
