import {TravelType} from './travel-type.enum';

export interface TravelFilter {
  startDate: string;
  endDate: string;
  minPrice: number;
  maxPrice: number;
  travelType: TravelType | null;
}
