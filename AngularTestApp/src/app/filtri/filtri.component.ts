import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

import {LabelType, NgxSliderModule, Options} from '@angular-slider/ngx-slider';
import {TravelType} from '../models/travel/travel-type.enum';
import {TravelFilter} from '../models/travel/travel-filter.model';

@Component({
  selector: 'app-filtri',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxSliderModule
  ],
  templateUrl: './filtri.component.html',
  styleUrl: './filtri.component.css'
})
export class FiltriComponent {
  @Input() filters!: TravelFilter;
  @Output() loadTravel = new EventEmitter<void>();
  @Output() resetTravels = new EventEmitter<void>();
  @Input() alertMessage!: string;
  @Input() isLoading!: boolean;
  travelTypes: TravelType[] = Object.values(TravelType).filter(type => type !== TravelType.NESSUNO);
  isExpanded: boolean = false; // Proprietà per mostrare/nascondere il pannello
  minValue: number = 100; // Valore minimo iniziale
  maxValue: number = 400; // Valore massimo iniziale
  options: Options = {
    floor: 0,
    ceil: 500,
    noSwitching: true,
    showTicksValues: true,
    tickStep: 100,
    tickValueStep: 100,
    getSelectionBarColor: () => {
      return 'black'
    },
    getPointerColor: () => {
      return 'black'
    },
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return '<b>Min price:</b> €' + value;
        case LabelType.High:
          return '<b>Max price:</b> €' + value;
        default:
          return '€' + value;
      }
    }
  };
  today: Date = new Date(); // Data di oggi
  minDate: string = this.formatDate(this.today); // Formatta la data in "YYYY-MM-DD"
  startDate: string = ''; // Valore per il primo date picker
  endDate: string = ''; // Valore per il secondo date picker
  endDateMin: string = this.minDate; // Valore minimo per il secondo date picker
  type: TravelType = TravelType.NESSUNO;

  // Aggiorna la data minima per il secondo date picker e controlla il valore
  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedStartDate = input.value;

    if (selectedStartDate) {
      this.endDateMin = selectedStartDate; // La data minima diventa la data iniziale

      // Controlla se la data finale è precedente alla data iniziale
      if (this.endDate && new Date(this.endDate) < new Date(selectedStartDate)) {
        this.endDate = selectedStartDate; // Aggiorna automaticamente la data finale
      }
    } else {
      this.endDateMin = this.minDate; // Ritorna alla data di oggi se il valore è nullo
    }
  }

  // Utility per formattare la data in "YYYY-MM-DD" per HTML5
  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mesi da 0 a 11
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  changeFormat(string: string): string {
    if (!string) {
      return 'gg-mm-yyyy';
    }
    const [year, month, day] = string.split('-');

    return `${day}-${month}-${year}`;
  }

  // Funzione per alternare lo stato di apertura
  toggleFilters(): void {
    console.log('Stato corrente:', this.isExpanded); // Aggiungi un log per verificare
    this.isExpanded = !this.isExpanded; // Cambia lo stato tra true e false
  }

  selectType(type: TravelType): void {
    this.type = type;
    console.log('Tipo selezionato:', type); // Log per verificare
  }

  // Per testare l'applicazione dei filtri
  applyFilters(): void {
    if (this.checkFiltersValidity()) {
      this.filters.startDate = this.startDate;
      this.filters.endDate = this.endDate;
      this.filters.minPrice = this.minValue;
      this.filters.maxPrice = this.maxValue;
      if (this.type === TravelType.NESSUNO) {
        this.filters.travelType = null;
      } else {
        this.filters.travelType = <TravelType>this.type.toUpperCase();
      }
      this.resetTravels.emit();
      this.loadTravel.emit();
    }
  }

  private checkFiltersValidity() {
    this.alertMessage = '';
    if (this.startDate) {
      const start = new Date(this.startDate);
      if (start < this.today) {
        this.alertMessage = 'La data di partenza non può essere precedente alla data di oggi';
        return false;
      }
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      if (end < this.today) {
        this.alertMessage = 'La data di ritorno non può essere precedente alla data di oggi';
        return false;
      }
    }
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      if (end < start) {
        this.alertMessage = 'La data di ritorno non può essere precedente alla data di partenza.';
        return false;
      }
    }
    if (this.minValue < 0) {
      this.alertMessage = 'Il prezzo minimo non può essere negativo.';
      return false;
    }
    if (this.maxValue < 0) {
      this.alertMessage = 'Il prezzo massimo non può essere negativo.';
      return false;
    }
    if (this.minValue > this.maxValue) {
      this.alertMessage = 'Il prezzo minimo non può essere superiore al prezzo massimo.';
      return false;
    }
    if (!Object.values(TravelType).includes(this.type)) {
      this.alertMessage = 'Il tipo di viaggio selezionato non è valido.';
      return false;
    }
    return true;
  }

  resetFilters(): void {
    this.today = new Date();
    this.minDate = this.formatDate(this.today);
    this.startDate = '';
    this.endDate = '';
    this.endDateMin = this.minDate;
    this.type = TravelType.NESSUNO;
    this.minValue = 100;
    this.maxValue = 400;
    this.isLoading = false;
    this.alertMessage = '';
  }
}
