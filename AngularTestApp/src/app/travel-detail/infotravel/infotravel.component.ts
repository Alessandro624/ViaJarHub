import {Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Travel} from '../../models/travel/travel.model';

import {ReviewComponent} from '../../review/review.component';
import {GoogleMapsModule} from '@angular/google-maps';
import {isPlatformBrowser, NgForOf, NgIf} from '@angular/common';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {TravelService} from '../travel.service';
import {ReviewService} from '../../review/review.service';
import {Review} from '../../models/review/review.module';

@Component({
  selector: 'app-infotravel',
  standalone: true,
  imports: [
    ReviewComponent,
    GoogleMapsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './infotravel.component.html',
  styleUrl: './infotravel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class InfotravelComponent implements OnInit {
  travel: Travel | undefined;
  center: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  markerPosition: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  zoom = 12;
  infoWindow: any;
  reviews: Review[] = [];
  stars: number = 0;
  fullStars: number[] = [];
  emptyStars: number[] = [];
  hasHalfStar: boolean = false;
  protected readonly environment = environment;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _travelService: TravelService, private _activatedRoute: ActivatedRoute, private _reviewService: ReviewService) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.parent?.snapshot.paramMap.get('id'));
    this.loadTravel(id);
    this.loadReviews(id);
    this.loadStars(id);
  }

  private loadTravel(id: number) {
    this._travelService.getTravelById(id).subscribe({
      next: result => {
        this.travel = result;
        if (this.travel) {
          this.center = {lat: this.travel.latitude, lng: this.travel.longitude};
          this.markerPosition = {lat: this.travel.latitude, lng: this.travel.longitude};
          if (isPlatformBrowser(this.platformId)) {
            this.initMap().then();
          }
        }
      }
    });
  }

  private loadReviews(id: number) {
    this._reviewService.getReviewsByTravel(id).subscribe({
      next: result => {
        console.log("prova " + result);
        this.reviews = result;
        console.log(this.reviews.length);
      }
    });
  }

  private loadStars(id: number) {
    this._travelService.getStars(id).subscribe({
      next: data => {
        this.stars = data;
        this.calculateStars();
      }, error: error => {
        this.stars = 0;
        this.calculateStars();
        console.log(error);
      }
    });
  }

  async initMap() {
    await customElements.whenDefined('gmp-map');
    const map = document.querySelector('gmp-map') as any;
    const marker = document.querySelector('gmp-advanced-marker') as any;

    map.innerMap.setOptions({
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    map.innerMap.addListener("center_changed", () => {
      window.setTimeout(() => {
        map.innerMap.panTo(marker.position as google.maps.LatLng);
      }, 5000);
    });

    marker.addEventListener('click', () => {
      this.infoWindow.open(map.innerMap, marker);
    });
  }

  calculateStars() {
    const hasHalf = this.stars % 1 !== 0;
    const full = Math.floor(this.stars);
    const empty = 5 - full - (hasHalf ? 1 : 0);
    this.fullStars = Array(full).fill(0);
    this.hasHalfStar = hasHalf;
    this.emptyStars = Array(empty).fill(0);
  }
}
