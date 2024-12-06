import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, Validators} from '@angular/forms';
import {CommonModule, DatePipe, NgIf, NgStyle} from '@angular/common';
import {MatSliderModule} from '@angular/material/slider';

import {ChangeContext, LabelType, NgxSliderModule, Options} from '@angular-slider/ngx-slider';



@Component({
  selector: 'app-filtri',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    NgStyle,
    NgIf,
    NgxSliderModule
  ],
  templateUrl: './filtri.component.html',
  styleUrl: './filtri.component.css'
})
export class FiltriComponent  {

  isExpanded: boolean = false; // Proprietà per mostrare/nascondere il pannello
  minValue: number = 100; // Valore minimo iniziale
  maxValue: number = 400; // Valore massimo iniziale

  options: Options = {
    floor: 0,
    ceil: 500,
    translate: (value: number, label: LabelType): string => {
      switch (label) {

        case LabelType.Low:
          console.log(value)
          return `<b>Min price:</b> $${value}`;
        case LabelType.High:
          console.log(LabelType.High)
          return `<b>Max price:</b> $${value}`;
        default:
          return `$${value}`;
      }
    }
  };
  today: Date = new Date(); // Data di oggi
  minDate: string = this.formatDate(this.today); // Formatta la data in "YYYY-MM-DD"
  startDate: string = this.formatDate(this.today); // Valore per il primo date picker
  endDate: string = this.formatDate(this.today); // Valore per il secondo date picker
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
    const [year, month, day] = string.split('-');
    return `${day}-${month}-${year}`;
  }

  // Verifica e corregge i valori quando l'utente termina l'interazione
  onUserChangeEnd(changeContext: ChangeContext): void {
    // Assicura che il valore minimo non superi il massimo
    if (this.minValue > this.maxValue) {
      this.minValue = this.maxValue;
    }
    // Assicura che il valore massimo non scenda sotto il minimo
    if (this.maxValue < this.minValue) {
      this.maxValue = this.minValue;
    }
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

  adjustRange() {
    // Correggi il range nel caso min superi max
    if (this.filters.priceRange.min > this.filters.priceRange.max) {
      const temp = this.filters.priceRange.min;
      this.filters.priceRange.min = this.filters.priceRange.max;
      this.filters.priceRange.max = temp;
    }
  }

  // Per testare l'applicazione dei filtri
  applyFilters(): void {
    console.log('Filtri applicati:', this.filters);
  }
}
