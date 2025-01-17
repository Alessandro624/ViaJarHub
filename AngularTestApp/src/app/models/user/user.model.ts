import {UserRole} from './user-role.enum';

export interface User {
  firstName: string;
  lastName: string;
  birthDate: Date;
  email: string;
  password: string;
  role: UserRole;
  authorities: any;
}
