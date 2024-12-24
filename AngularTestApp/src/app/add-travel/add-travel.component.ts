import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  Inject,
  PLATFORM_ID,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from '../travel.service';
import {environment} from '../../environments/environment';
import {GoogleMapsModule} from '@angular/google-maps';

@Component({
  selector: 'app-add-travel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    GoogleMapsModule

  ],
  templateUrl: './add-travel.component.html',
  styleUrl: './add-travel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AddTravelComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;//consente di accedere all'elemento del DOM
  today: string = new Date().toISOString().split('T')[0];
  travel: Travel = {
    id: 0,
    destinazione: '',
    dataPartenza: '',
    dataRitorno: '',
    descrizione: '',
    prezzo: 0,
    postiDisponibile: 0,
    tipo: '',
    numeroStelle: 0,
    immagini: [],
    latitude: 0,
    longitude: 0
  };
  dateErrors = {startDateInvalid: false, endDateInvalid: false};
  center: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  markerPosition: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  zoom = 10;
  isCountry: boolean = false;
  selectedOption: string = '1';

  constructor(private travelService: TravelService, @Inject(PLATFORM_ID) private platformId: Object) {
  }

  resetData() {
    this.travel = {
      id: 0,
      destinazione: '',
      dataPartenza: '',
      dataRitorno: '',
      descrizione: '',
      prezzo: 0,
      postiDisponibile: 0,
      tipo: '',
      numeroStelle: 0,
      immagini: [],
      latitude: 0,
      longitude: 0
    };
    this.dateErrors = {startDateInvalid: false, endDateInvalid: false};
  }

  onSubmit() {
    this.travel.latitude = this.markerPosition.lat;
    this.travel.longitude = this.markerPosition.lng;
    console.log('Dati del form:', this.travel);
    console.log('Immagini caricate:', this.travel.immagini);


    // Mostra conferma e chiudi il modale
    alert(`Form inviato con successo!\nDestinazione: ${this.travel.destinazione}\nData di Partenza: ${this.travel.dataPartenza}\nData di Ritorno: ${this.travel.dataRitorno}\nDescrizione: ${this.travel.descrizione}\nNumero di immagini: ${this.travel.immagini.length}`);
    this.closeModal.emit();
    this.resetData();
  }

  validateAndFormatPrice(event: any) {
    const input = event.target.value;
    const pricePattern = /^\d*\.?\d*$/;
    if (!pricePattern.test(input)) {
      event.target.value = input.slice(0, -1);
    } else {
      this.travel.prezzo = input;
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    this.addFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(files);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click(); // Attiva l'input file nascosto
  }

  validateDates() {
    const today = new Date();
    const startDate = new Date(this.travel.dataPartenza);
    const endDate = new Date(this.travel.dataRitorno); // Controlla se la data di partenza è minore di oggi (solo se una data di partenza è stata inserita) if (this.formData.startDate) { this.dateErrors.startDateInvalid = startDate < today.setHours(0, 0, 0, 0); } else { this.dateErrors.startDateInvalid = false; } // Controlla se la data di ritorno è minore della data di partenza (solo se entrambe le date sono state inserite)
    if (this.travel.dataPartenza && this.travel.dataRitorno) {
      this.dateErrors.endDateInvalid = endDate < startDate;
    } else {
      this.dateErrors.endDateInvalid = false;
    }
  }

  hasDateErrors(): boolean {
    return this.dateErrors.startDateInvalid || this.dateErrors.endDateInvalid;
  }

  private addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.travel.immagini.push(files[i]);
    }
  }

  removeImage(index: number) {
    this.travel.immagini.splice(index, 1);
  }

  selectType(tipo: string) {
    this.travel.tipo = tipo;
  }

  addTravel() {
    // TODO aggiungere logica per modificare le date prima di inviarle nel formato dd/mm/yyyy
    this.travelService.addTravel(this.travel);

  }

  protected readonly environment = environment;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap().then();
    }


  }

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
        console.log(country);
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


  setOption(b: boolean) {
    this.isCountry = b;
    if (this.isCountry) {
      this.zoom = 5;

    } else {
      this.zoom = 10;
    }

  }
}
