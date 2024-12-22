import {Component, OnInit} from '@angular/core';
import {Travel} from '../../models/travel/travel.model';

import {TravelService} from '../../travel.service';
import {ActivatedRoute} from '@angular/router';
import {ReviewComponent} from '../../review/review.component';
import {GoogleMap, GoogleMapsModule, MapMarker} from '@angular/google-maps';
import {MapsService} from '../../maps.service';
import {CommonModule, NgIf} from '@angular/common';

@Component({
  selector: 'app-infotravel',
  standalone: true,
  imports: [
    ReviewComponent,
    GoogleMap,
    MapMarker,
    NgIf,
    GoogleMapsModule
  ],
  templateUrl: './infotravel.component.html',
  styleUrl: './infotravel.component.css'
})
export class InfotravelComponent implements OnInit {
  travel!: Travel | undefined;
  lat = 51.678418;
  lng = 7.809007;
  center: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPosition: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};

  constructor(private travelservice: TravelService, private _activatedRoute: ActivatedRoute, private mapsService: MapsService) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    if (id == null) {
      throw new Error("Viaggio non trovato");

    }
    let lat = 51.678418;
    let lng = 7.809007;
    this.travel = this.travelservice.getTravelById(id);

    this.showMap(this.center.lat, this.center.lng);
  }

  showMap(latitude: number, longitude: number) {
    this.mapsService.getMap({latitude, longitude}).subscribe(response => {
      if (response.results && response.results.length > 0) {
        console.log(response.results);
        const location = response.results[0].geometry.location;
        this.center = {lat: location.lat, lng: location.lng};
        this.markerPosition = {lat: location.lat, lng: location.lng};
      }
    });
  }


}

