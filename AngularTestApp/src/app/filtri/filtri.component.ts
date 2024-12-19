import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

import {LabelType, NgxSliderModule, Options} from '@angular-slider/ngx-slider';

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

  filters = {
    date: new Date(),
    priceRange: {
      min: 100,
      max: 500,
    },
    type: ''
  };

  // Funzione per alternare lo stato di apertura
  toggleFilters(): void {
    console.log('Stato corrente:', this.isExpanded); // Aggiungi un log per verificare

    this.isExpanded = !this.isExpanded; // Cambia lo stato tra true e false
  }

  selectType(type: string): void {
    this.filters.type = type;
    console.log('Tipo selezionato:', this.filters.type); // Log per verificare
  }

// Per testare l'applicazione dei filtri
  applyFilters(): void {
    console.log('Filtri applicati:', this.filters);
  }
}
