import {Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Travel} from '../../models/travel/travel.model';

import {TravelService} from '../../travel.service';
import {ReviewComponent} from '../../review/review.component';
import {GoogleMapsModule} from '@angular/google-maps';
import {isPlatformBrowser} from '@angular/common';
import {environment} from '../../../environments/environment';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-infotravel',
  standalone: true,
  imports: [
    ReviewComponent,
    GoogleMapsModule
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
  protected readonly environment = environment;

  /*lat = 51.678418;
  lng = 7.809007;
  center: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  zoom = 15;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPosition: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  */

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _travelService: TravelService, private _activatedRoute: ActivatedRoute, /*private mapsService: MapsService*/) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap().then();
    }
    const id = Number(this._activatedRoute.parent?.snapshot.paramMap.get('id'));
    this._travelService.getTravelById(id).subscribe({
      next: result => {
        this.travel = result;
        if (this.travel) {
          this.center = {lat: this.travel.latitude, lng: this.travel.longitude};
          this.markerPosition = {lat: this.travel.latitude, lng: this.travel.longitude};
        }
      }
    });
    /*let lat = 51.678418;
    let lng = 7.809007;
    this.showMap(this.center.lat, this.center.lng);*/
  }

  /*showMap(latitude: number, longitude: number) {
    this.mapsService.getMap({latitude, longitude}).subscribe(response => {
      if (response.results && response.results.length > 0) {
        console.log(response.results);
        const location = response.results[0].geometry.location;
        this.center = {lat: location.lat, lng: location.lng};
        this.markerPosition = {lat: location.lat, lng: location.lng};
      }
    });
  }*/

  async initMap() {
    await customElements.whenDefined('gmp-map');

    const map = document.querySelector('gmp-map') as any;
    const marker = document.querySelector('gmp-advanced-marker') as any;
    const placePicker = document.querySelector('gmpx-place-picker') as any;
    const infoWindow = new google.maps.InfoWindow();

    map.innerMap.setOptions({
      mapTypeControl: false
    });

    /* DOPO 3 secondi ti riporta al marker
    map.innerMap.addListener("center_changed", () => {
      window.setTimeout(() => {
        map.innerMap.panTo(marker.position as google.maps.LatLng);
      }, 3000);
    });
    */

    map.innerMap.addListener('click', (event: google.maps.MapMouseEvent) => {
      const location = event.latLng;
      if (!location) {
        window.alert(
          "No details available for input: '" + location + "'"
        );
        infoWindow.close();
        marker.position = null;
        return;
      }
      if (!map.innerMap.getBounds().contains(location)) {
        map.innerMap.panTo(location);
      }
      marker.position = location;
      map.innerMap.setZoom(this.zoom);
      this.getLocationDetails(location, infoWindow, map, marker);
    });

    placePicker.addEventListener('gmpx-placechange', () => {
      const place = placePicker.value;

      if (!place.location) {
        window.alert(
          "No details available for input: '" + place.name + "'"
        );
        infoWindow.close();
        marker.position = null;
        return;
      }

      if (place.viewport) {
        map.innerMap.fitBounds(place.viewport);
      } else {
        map.center = place.location;
        map.zoom = this.zoom;
      }

      marker.position = place.location;
      infoWindow.setContent(
        `<strong>${place.displayName}</strong><br>
         <span>${place.formattedAddress}</span>`
      );
      infoWindow.open(map.innerMap, marker);
    });
  }

  getLocationDetails(location: google.maps.LatLng, infoWindow: google.maps.InfoWindow, map: {
    innerMap: google.maps.InfoWindowOpenOptions | google.maps.Map | google.maps.StreetViewPanorama | null | undefined;
  }, marker: any) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({location: location}, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0];
        console.log(results[0]);
        const city = location.address_components.find(component =>
          component.types.includes('administrative_area_level_3')
        )?.long_name;
        const country = location.address_components.find(component =>
          component.types.includes('country')
        )?.long_name;
        infoWindow.setContent(
          `<strong>${city}, ${country}</strong><br>
         <span>${location.formatted_address}</span>`
        );
        infoWindow.open(map.innerMap, marker);
      } else {
        console.error('Geocoding failed:', status);
      }
    }).then();
  }
}
