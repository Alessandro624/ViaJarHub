import {Routes} from '@angular/router';
import {Body1Component} from './body1/body1.component';
import {TravelDetailComponent} from './travel-detail/travel-detail.component';
import {CarouselComponent} from './carousel/carousel.component';
import {InfotravelComponent} from './travel-detail/infotravel/infotravel.component';
import {ClientComponent} from './profile/client/client.component';
import {AdminComponent} from './profile/admin/admin.component';
import {LoginComponent} from './login/login.component';
import {authenticationGuard} from './login/authentication.guard';
import {UserRole} from './models/user/user-role.enum';

export const routes: Routes = [
  {path: '', redirectTo: 'body1', pathMatch: 'full'},
  {path: 'body1', component: Body1Component},
  {
    path: 'body1/:id', component: TravelDetailComponent, children: [
      {path: 'img', component: CarouselComponent},
      {path: 'info', component: InfotravelComponent},
      {path: '', redirectTo: 'info', pathMatch: 'full'}
    ]
  },
  {path: 'client', component: ClientComponent, canActivate: [authenticationGuard]},
  {path: 'admin', component: AdminComponent, canActivate: [authenticationGuard], data: {requiredRoles: UserRole.ADMIN}},
  {path: 'login', component: LoginComponent}
];
