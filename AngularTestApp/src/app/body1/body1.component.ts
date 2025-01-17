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
import {ActivatedRoute} from '@angular/router';
import {translateOrder, TravelOrder} from '../models/travel/travel-order.enum';

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
  index: number = 0;
  elementiTot: number = 0;
  filters: TravelFilter = {
    searchQuery: '',
    startDate: '',
    endDate: '',
    minPrice: 0,
    maxPrice: 0,
    travelType: null,
    travelOrder: null,
    reverse: false
  }
  alertMessage: string = '';
  isLoading: boolean = false;
  travelOrders: TravelOrder[] = Object.values(TravelOrder);
  maxPrice: number = 0;

  constructor(private _travelService: TravelService, private _authenticationService: AuthenticationService, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.getMaxPrice();
    this._activatedRoute.queryParams.subscribe(params => {
      const searchQuery = params['search'] || '';
      this.setSearchQuery(searchQuery);
      this._authenticationService.currentUser$
        .pipe(
          switchMap(() => this.loadInit(0))
        )
        .subscribe({
          error: error => {
            this.alertMessage = error.message;
            this.isLoading = false;
          }
        });
    });
  }

  private loadInit(index: number) {
    return this.countTravels().pipe(
      tap(data => (this.elementiTot = data)),
      switchMap(() => this._travelService.getTravelsPaginated(index, 9, this.filters)),
      tap(travels => {
        if (index === 0) {
          this.resetTravels();
        }
        this.travels = [...this.travels, ...travels];
        this.travelsMatrix = this.chunkArray(this.travels, 3);
        this.index = index + 9;
      })
    );
  }

  private countTravels() {
    return this._travelService.getTravelsCount(this.filters);
  }

  private setSearchQuery(query: string) {
    this.filters.searchQuery = query;
  }

  loadTravels(index: number) {
    this.isLoading = true;
    this.loadInit(index).subscribe(() => this.isLoading = false);
  }

  private chunkArray(array: Travel[], chunkSize: number): Travel[][] {
    const chunks: Travel[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private resetTravels() {
    this.travels = [];
    this.travelsMatrix = [];
    this.index = 0;
  }

  localDeleteTravel(id: number): void {
    this.travels = this.travels.filter(travel => travel.id !== id);
    this.travelsMatrix = this.chunkArray(this.travels, 3);
  }

  setOrder(order: TravelOrder) {
    const input = this.translateTravelOrder(order);
    if (this.filters.travelOrder !== input) {
      this.filters.travelOrder = input;
      this.loadTravels(0);
    }
  }

  toggleReverse() {
    this.filters.reverse = !this.filters.reverse;
    this.loadTravels(0);
  }

  translateTravelOrder(order: TravelOrder) {
    return <TravelOrder>translateOrder(order);
  }

  private getMaxPrice() {
    this._travelService.getMaxPrice().subscribe({
      next: data => {
        this.maxPrice = data;
        this.filters.maxPrice = this.maxPrice;
      }
    });
  }
}
