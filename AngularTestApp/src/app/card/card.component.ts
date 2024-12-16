import {Component, Input} from '@angular/core';
import {Travel} from '../models/travel/travel.module';
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
export class CardComponent {
  @Input() travel!: Travel;
}
