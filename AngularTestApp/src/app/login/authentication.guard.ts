import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {UserRole} from '../models/user/user-role.enum';
import {firstValueFrom} from 'rxjs';

export const authenticationGuard: CanActivateFn = (route) => {
  const _authService = inject(AuthenticationService);
  const _router = inject(Router);
  const expectedRole: UserRole[] = route.data['requiredRoles'];
  return firstValueFrom(_authService.getUser())
    .then(user => {
      if (user) {
        if (!expectedRole || expectedRole == user.authorities[0].authority) {
          return true;
        }
        _router.navigate(['403']).then();
        return false;
      }
      _router.navigate(['login']).then();
      return false;
    })
    .catch(() => _router.navigate(['login']));
};
