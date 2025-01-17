import {Sender} from './sender.enum';

export interface Message {
  sender: Sender;
  text: string;
}
