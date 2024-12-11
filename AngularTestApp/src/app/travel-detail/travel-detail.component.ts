import { Component } from '@angular/core';
import {CarouselComponent} from '../carousel/carousel.component';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [
    CarouselComponent,
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.css'
})
export class TravelDetailComponent {
  // Qui puoi aggiungere logica personalizzata e dati per popolare dinamicamente il componente



}
