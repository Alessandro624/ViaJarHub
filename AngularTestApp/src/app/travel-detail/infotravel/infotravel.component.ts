import {Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Travel} from '../../models/travel/travel.model';

import {ReviewComponent} from '../../review/review.component';
import {GoogleMapsModule} from '@angular/google-maps';
import {isPlatformBrowser, NgIf} from '@angular/common';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';
import {TravelService} from '../travel.service';

@Component({
  selector: 'app-infotravel',
  standalone: true,
  imports: [
    ReviewComponent,
    GoogleMapsModule,
    NgIf
  ],
  templateUrl: './infotravel.component.html',
  styleUrl: './infotravel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class InfotravelComponent implements OnInit {
  travel: Travel | undefined;
  center: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  markerPosition: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  zoom = 15;
  infoWindow: any;
  protected readonly environment = environment;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _travelService: TravelService, private _activatedRoute: ActivatedRoute, /*private mapsService: MapsService*/) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.parent?.snapshot.paramMap.get('id'));
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

  async initMap() {
    await customElements.whenDefined('gmp-map');
    const map = document.querySelector('gmp-map') as any;
    const marker = document.querySelector('gmp-advanced-marker') as any;
    this.infoWindow = new google.maps.InfoWindow();
    this.infoWindow.setContent(`<strong>${this.travel?.destination}</strong>`);
    this.infoWindow.open(map.innerMap, marker);

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
}
