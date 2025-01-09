import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Inject, OnInit,
  Output,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from '../travel-detail/travel.service';
import {environment} from '../../environments/environment';
import {TravelType} from '../models/travel/travel-type.enum';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-add-travel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-travel.component.html',
  styleUrl: './add-travel.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddTravelComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;//consente di accedere all'elemento del DOM
  today: string = new Date().toISOString().split('T')[0];
  travel: Travel = {
    id: 0,
    destination: '',
    isCountry: false,
    startDate: '',
    endDate: '',
    description: '',
    oldPrice: 0,
    price: 0,
    maxParticipantsNumber: 0,
    travelType: TravelType.NESSUNO,
    latitude: 0,
    longitude: 0
  };
  alertMessage: string = '';
  imageError: string = '';
  isLoading: boolean = false;
  images: File[] = [];
  imagesUrl: string[] = [];
  dateErrors = {startDateInvalid: '', endDateInvalid: ''};
  center: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  markerPosition: google.maps.LatLngLiteral = {lat: 51.678418, lng: 7.809007};
  zoom = 15;
  travelTypes: TravelType[] = Object.values(TravelType).filter(type => type !== TravelType.NESSUNO);
  protected readonly environment = environment;
  protected readonly TravelType = TravelType;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private travelService: TravelService, private alertService: AlertService) {
  }

  ngOnInit(): void {
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
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    map.innerMap.addListener('click', (event: google.maps.MapMouseEvent) => {
      const location = event.latLng;
      if (!location) {
        window.alert(
          "Nessun dettaglio per: '" + location + "'"
        );
        infoWindow.close();
        marker.position = null;
        this.resetTravelCoordinates();
        return;
      }
      if (!map.innerMap.getBounds().contains(location)) {
        map.innerMap.panTo(location);
      }
      this.setTravelCoordinates(location.lat(), location.lng());
      marker.position = location;
      map.innerMap.setZoom(this.zoom);
      this.getLocationDetails(location, infoWindow, map, marker);
    });

    placePicker.addEventListener('gmpx-placechange', () => {
      const place = placePicker.value;

      if (!place.location) {
        window.alert(
          "Nessun dettaglio per:  '" + place.name + "'"
        );
        infoWindow.close();
        marker.position = null;
        this.resetTravelCoordinates();
        return;
      }

      if (place.viewport) {
        map.innerMap.fitBounds(place.viewport);
      } else {
        map.center = place.location;
        map.zoom = this.zoom;
      }
      this.setTravelCoordinates(place.location.lat(), place.location.lng());
      marker.position = place.location;
      infoWindow.setContent(
        `<strong>${place.displayName}</strong><br>
         <span>${place.formattedAddress}</span>`
      );
      infoWindow.open(map.innerMap, marker);
    });
  }

  private getLocationDetails(location: google.maps.LatLng, infoWindow: google.maps.InfoWindow, map: {
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

  resetData() {
    this.travel = {
      id: 0,
      destination: '',
      isCountry: false,
      startDate: '',
      endDate: '',
      description: '',
      oldPrice: 0,
      price: 0,
      maxParticipantsNumber: 0,
      travelType: TravelType.NESSUNO,
      latitude: 0,
      longitude: 0
    };
    this.images = [];
    this.imagesUrl = [];
    this.dateErrors = {startDateInvalid: '', endDateInvalid: ''};
    this.center = {lat: 51.678418, lng: 7.809007};
    this.markerPosition = {lat: 51.678418, lng: 7.809007};
    this.zoom = 15;
    this.alertMessage = '';
    this.isLoading = false;
    this.imageError = '';
  }

  onSubmit() {
    this.isLoading = true;
    console.log('Dati del form:', this.travel);
    console.log('Immagini caricate:', this.images);
    const travelType = this.travel.travelType;
    this.travel.travelType = <TravelType>travelType.toUpperCase();
    this.travelService.addTravel(this.travel, this.images).subscribe({
      next: () => {
        this.isLoading = false;
        this.alertService.showAlert("Form inviato con successo!\nDestinazione: ${this.travel.destination}\nData di Partenza: ${this.travel.startDate}\nData di Ritorno: ${this.travel.endDate}\nDescrizione: ${this.travel.description}\nNumero di immagini: ${this.images.length}", true)

        this.closeModal.emit();
        this.resetData();
      }, error: error => {
        this.alertMessage = error.message;
        this.isLoading = false;
        this.travel.travelType = travelType;
      }
    });
  }

  onFileSelect(event: any) {
    this.checkAndAddFiles(event.target.files);
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
    this.checkAndAddFiles(event.dataTransfer?.files);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click(); // Attiva l'input file nascosto
  }

  validateDates() {
    const today = new Date();
    const startDate = new Date(this.travel.startDate);
    const endDate = new Date(this.travel.endDate); // Controlla se la data di partenza è minore di oggi (solo se una data di partenza è stata inserita) if (this.formData.startDate) { this.dateErrors.startDateInvalid = startDate < today.setHours(0, 0, 0, 0); } else { this.dateErrors.startDateInvalid = false; } // Controlla se la data di ritorno è minore della data di partenza (solo se entrambe le date sono state inserite)
    if (startDate && startDate < today) {
      this.dateErrors.startDateInvalid = 'La data di partenza non può essere precedente ad oggi'
    } else {
      this.dateErrors.startDateInvalid = '';
    }
    if (endDate && endDate < today) {
      this.dateErrors.endDateInvalid = 'La data di ritorno non può essere precedente ad oggi'
    } else {
      this.dateErrors.endDateInvalid = '';
    }
    if (startDate && endDate && endDate < startDate) {
      this.dateErrors.endDateInvalid = 'La data di ritorno non può essere precedente a quella di partenza';
    } else {
      this.dateErrors.endDateInvalid = '';
    }
  }

  private addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.images.push(files[i]);
      this.imagesUrl.push(URL.createObjectURL(files[i]));
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imagesUrl.splice(index, 1);
  }

  selectType(type: TravelType) {
    this.travel.travelType = type;
  }

  private resetTravelCoordinates() {
    this.travel.latitude = 0;
    this.travel.longitude = 0;
  }

  private setTravelCoordinates(lat: number, lng: number) {
    this.travel.latitude = lat;
    this.travel.longitude = lng;
  }

  private checkAndAddFiles(files: FileList | undefined) {
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
          this.imageError = 'Sono consentite solo immagini';
          return;
        }
      }
      this.addFiles(files);
    }
  }
}
