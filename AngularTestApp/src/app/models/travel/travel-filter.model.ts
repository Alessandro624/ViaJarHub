import {TravelType} from './travel-type.enum';
import {TravelOrder} from './travel-order.enum';

export interface TravelFilter {
  searchQuery: string;
  startDate: string;
  endDate: string;
  minPrice: number;
  maxPrice: number;
  travelType: TravelType | null;
  travelOrder: TravelOrder | null;
  reverse: boolean;
}
