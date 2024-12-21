import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Travel} from '../models/travel/travel.model';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit, OnDestroy {
  @Input() travel!: Travel;
  copertina: string | null = null;

  ngOnDestroy(): void {
    if (this.copertina && this.travel?.immagini[0] instanceof File) {
      URL.revokeObjectURL(this.copertina);
    }
  }

  ngOnInit(): void {
    if (this.travel?.immagini && this.travel.immagini.length > 0) {
      const firstImage = this.travel.immagini[0];
      this.copertina = firstImage instanceof File ? URL.createObjectURL(firstImage) : firstImage;
    }
  }


}
