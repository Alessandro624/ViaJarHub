import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CarouselComponent} from '../carousel/carousel.component';
import {CardComponent} from '../card/card.component';
import {FiltriComponent} from '../filtri/filtri.component';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from '../travel.service';

@Component({
  selector: 'app-body1',
  standalone: true,
  imports: [CommonModule, CarouselComponent, CardComponent, FiltriComponent],
  templateUrl: './body1.component.html',
  styleUrls: ['./body1.component.css']
})

export class Body1Component implements OnInit {
  travels: Travel[] = [];
  travelsMatrix: Travel[][] = []
  index: number = 0;//indice per caricare 9 viaggi alla volta
  elementiTot: number = 0;

  constructor(private travelService: TravelService) {
  }

  ngOnInit() {
    this.loadTravels()
    this.travelService.getLenghtTravels().subscribe({
      next: data => {
        this.elementiTot = data;
      }
    });
  }

  loadTravels() {
    this.travelService.getTravelsPaginated(this.index, 9).subscribe({
      next: data => {
        this.travels = [...this.travels, ...data];
        this.travelsMatrix = this.chunkArray(this.travels, 3);
        this.index += 9;
      }
    });
  }

  private chunkArray(array: Travel[], chunkSize: number): Travel[][] {
    const chunks: Travel[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
