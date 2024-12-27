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
  isLoading: boolean = false;
  alertMessage: string = '';
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
    // TODO rivedere il loading, andrebbe passato nella funzione
    this.isLoading = true;
    this.checkFiltersValidity();
    this.filters.startDate = this.startDate;
    this.filters.endDate = this.endDate;
    this.filters.minPrice = this.minValue;
    this.filters.maxPrice = this.maxValue;
    if (this.type === TravelType.NESSUNO) {
      this.filters.travelType = null;
    } else {
      this.filters.travelType = <TravelType>this.type.toUpperCase();
    }
    console.log('Filtri applicati:', this.filters);
    this.resetTravels.emit();
    this.loadTravel.emit();
    this.isLoading = false;
  }

  private checkFiltersValidity() {
    // TODO
  }

  resetFilters(): void {
    this.today = new Date();
    this.minDate = this.formatDate(this.today);
    this.startDate = '';
    this.endDate = '';
    this.endDateMin = this.minDate;
    this.type = TravelType.NESSUNO;
    this.filters = {
      startDate: '',
      endDate: '',
      minPrice: 0,
      maxPrice: 0,
      travelType: TravelType.NESSUNO,
    }
    this.isLoading = false;
    this.alertMessage = '';
  }
}
