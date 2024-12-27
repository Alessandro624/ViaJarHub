import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CarouselComponent} from '../carousel/carousel.component';
import {CardComponent} from '../card/card.component';
import {FiltriComponent} from '../filtri/filtri.component';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from '../travel-detail/travel.service';
import {TravelFilter} from '../models/travel/travel-filter.model';
import {switchMap, tap} from 'rxjs';
import {AuthenticationService} from '../login/authentication.service';

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
  filters: TravelFilter = {
    startDate: '',
    endDate: '',
    minPrice: 0,
    maxPrice: 0,
    travelType: null,
  }

  constructor(private _travelService: TravelService, private _authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this._authenticationService.currentUser$
      .pipe(
        tap(() => this.resetTravels()),
        switchMap(() => this.loadInit())
      )
      .subscribe({
        error: error => console.error('Errore nel caricamento dei viaggi:', error)
      });
  }

  loadTravels() {
    this.loadInit().subscribe();
  }

  loadInit() {
    return this.countTravels().pipe(
      tap(data => (this.elementiTot = data)),
      switchMap(() => this._travelService.getTravelsPaginated(this.index, 9, this.filters)),
      tap(travels => {
        if (this.index === 0) {
          this.resetTravels();
        }
        this.travels = [...this.travels, ...travels];
        this.travelsMatrix = this.chunkArray(this.travels, 3);
        this.index += 9;
      })
    );
  }

  private chunkArray(array: Travel[], chunkSize: number): Travel[][] {
    const chunks: Travel[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private countTravels() {
    return this._travelService.getTravelsCount(this.filters);
  }

  resetTravels() {
    this.travels = [];
    this.travelsMatrix = [];
    this.index = 0;
  }
}
