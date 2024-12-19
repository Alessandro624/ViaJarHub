import {UserRole} from './user-role.enum';
import {AuthProvider} from './auth-provider.enum';

export interface User {
  firstName: string;
  lastName: string;
  birthDate: Date;
  email: string;
  password: string;
  profileImagePath: string;
  role: UserRole;
  provider: AuthProvider;
  authorities: any;
}
