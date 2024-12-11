import { Routes } from '@angular/router';
import { Body1Component } from './body1/body1.component';
import { Body2Component } from './body2/body2.component';
import {TravelDetailComponent} from './travel-detail/travel-detail.component';
import {CarouselComponent} from './carousel/carousel.component';
import {InfotravelComponent} from './travel-detail/infotravel/infotravel.component';

export const routes: Routes = [
  { path: '', redirectTo: 'body1', pathMatch: 'full' },
  { path: 'body1', component: Body1Component },
  { path: 'body2', component: Body2Component },
  { path: 'prova', component: TravelDetailComponent ,children:[
      {path: 'img', component: CarouselComponent},
      {path: 'info', component: InfotravelComponent},
      { path: '', redirectTo: 'info', pathMatch: 'full' }
    ]}

];
