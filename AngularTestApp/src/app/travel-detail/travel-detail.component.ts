import { Component } from '@angular/core';
import {CarouselComponent} from '../carousel/carousel.component';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [
    CarouselComponent
  ],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.css'
})
export class TravelDetailComponent {
  // Qui puoi aggiungere logica personalizzata e dati per popolare dinamicamente il componente
  reviews: { user: string; text: string }[] = [
    { user: 'Utente 1', text: 'Questo prodotto è fantastico!' },
    { user: 'Utente 2', text: 'Ottima qualità e spedizione rapida.' },
    { user: 'Utente 3', text: 'Consigliato al 100%!' },
  ];

  addReview(newReview: string) {
    if (newReview.trim()) {
      this.reviews.push({ user: 'Nuovo Utente', text: newReview });
    }
  }
}
