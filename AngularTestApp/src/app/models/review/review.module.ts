import {User} from '../user/user.model';
import {Travel} from '../travel/travel.model';

export interface Review {
  travel: Travel;
  user: User;
  stars: number;
  comment: string;
  data: string;
}
