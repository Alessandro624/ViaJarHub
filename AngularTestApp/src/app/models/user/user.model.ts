import {UserRole} from './user-role.enum';

export interface User {
  firstName: string;
  lastName: string;
  birthDate: Date;
  email: string;
  password: string;
  profileImagePath: string;
  role: UserRole;
  authorities: any;
}
