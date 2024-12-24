import {Component, Input, OnInit} from '@angular/core';
import {Travel} from '../models/travel/travel.model';
import {RouterLink} from '@angular/router';
import {TravelService} from '../travel-detail/travel.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  @Input() travel!: Travel;
  copertina: string | null = null;

  constructor(private _travelService: TravelService) {
  }

  ngOnInit(): void {
    this._travelService.getTravelImages(this.travel.id).subscribe(
      {
        next: data => {
          this.copertina = `data:image/jpeg;base64,${data[0]}`;
        },
        error: error => {
          console.log(error);
        }
      }
    )
  }
}
