import {TravelType} from './travel-type.enum';

export interface TravelFilter {
  searchQuery: string;
  startDate: string;
  endDate: string;
  minPrice: number;
  maxPrice: number;
  travelType: TravelType | null;
}
