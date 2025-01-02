import {Component, EventEmitter, input, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxSliderModule, Options, LabelType} from '@angular-slider/ngx-slider';
import {TravelFilter} from '../models/travel/travel-filter.model';
import {TravelType} from '../models/travel/travel-type.enum';
import {type} from 'node:os';

@Component({
  selector: 'app-filtri',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxSliderModule
  ],
  templateUrl: './filtri.component.html',
  styleUrls: ['./filtri.component.css']
})
export class FiltriComponent implements OnChanges {
  @Input() filters!: TravelFilter;
  @Output() loadTravel = new EventEmitter<void>();
  @Input() alertMessage!: string;
  @Input() isLoading!: boolean;

  travelTypes: TravelType[] = Object.values(TravelType).filter(type => type !== TravelType.NESSUNO);
  isExpanded: boolean = false;
  minValue: number = 0;
  maxValue: number = 1000;
  options: Options = {
    floor: 0,
    noSwitching: true,
    showTicksValues: true,
    tickStep: 100,
    tickValueStep: 100,
    getSelectionBarColor: () => 'black',
    getPointerColor: () => 'black',
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
  today: Date = new Date();
  minDate: string = this.formatDate(this.today);
  startDate: string = '';
  endDate: string = '';
  endDateMin: string = this.minDate;
  type: TravelType = TravelType.NESSUNO;


  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedStartDate = input.value;

    if (selectedStartDate) {
      this.endDateMin = selectedStartDate;

      if (this.endDate && new Date(this.endDate) < new Date(selectedStartDate)) {
        this.endDate = selectedStartDate;
      }
    } else {
      this.endDateMin = this.minDate;
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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

  toggleFilters(): void {
    console.log('Stato corrente:', this.isExpanded);
    this.isExpanded = !this.isExpanded;
  }

  selectType(type: TravelType): void {
    this.type = type;
    console.log('Tipo selezionato:', type);
  }

  applyFilters(): void {
    if (this.checkFiltersValidity()) {
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
        this.loadTravel.emit();
      }
    }
  }

  private checkFiltersValidity(): boolean {
    this.alertMessage = '';
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.today.setHours(0, 0, 0, 0);
    if (this.startDate && start < this.today) {
      this.alertMessage = 'La data di partenza non può essere precedente alla data di oggi';
      return false;
    }
    if (this.endDate && end < this.today) {
      this.alertMessage = 'La data di ritorno non può essere precedente alla data di oggi';
      return false;
    }
    if (this.startDate && this.endDate && end < start) {
      this.alertMessage = 'La data di ritorno non può essere precedente alla data di partenza.';
      return false;
    }
    if (this.minValue < 0 || this.maxValue < 0 || this.minValue > this.maxValue) {
      this.alertMessage = 'Il prezzo minimo non può essere negativo o superiore al prezzo massimo.';
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
    this.minValue = 0;
    this.maxValue = 1000;
    this.isLoading = false;
    this.alertMessage = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.options.ceil = this.filters.maxPrice;

  }
}
