import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Travel} from '../models/travel/travel.model';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {TravelService} from '../travel-detail/travel.service';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-update-travel',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './update-travel.component.html',
  styleUrl: './update-travel.component.css'
})
export class UpdateTravelComponent implements OnInit {
  @Input() travel!: Travel;
  selectedTravel!: Travel;
  @Output() closeUpdateTravel = new EventEmitter<void>();
  @Output() loadTravels = new EventEmitter<void>();
  isLoading: boolean = false;
  alertMessage: string = '';
  today: string = new Date().toISOString().split('T')[0];
  dateErrors = {startDateInvalid: '', endDateInvalid: ''};

  constructor(private _travelService: TravelService, private _alertService: AlertService) {
  }

  ngOnInit(): void {
    this.selectedTravel = {...this.travel};
  }

  updateTravel() {
    this.validateDates();
    if (!this.dateErrors.startDateInvalid && !this.dateErrors.endDateInvalid) {
      this.isLoading = true;
      this.alertMessage = '';
      this._travelService.updateTravel(this.travel.id, this.selectedTravel, []).subscribe({
          next: () => {
            this.isLoading = false;
            this.setTravel();
            this._alertService.showAlert("Viaggio modificato con successo", true);
            this.closeUpdateTravel.emit();
          }, error: error => {
            this.isLoading = false;
            this.alertMessage = error.message;
          }
        }
      );
    }
  }

  validateDates() {
    const startDate = new Date(this.selectedTravel.startDate);
    const endDate = new Date(this.selectedTravel.endDate);
    if (startDate && endDate && endDate < startDate) {
      this.dateErrors.endDateInvalid = 'La data di ritorno non può essere precedente a quella di partenza';
    } else {
      this.dateErrors.endDateInvalid = '';
    }
    const today = new Date();
    if (endDate && endDate < today) {
      this.dateErrors.endDateInvalid = 'La data di ritorno non può essere precedente ad oggi'
    } else {
      this.dateErrors.endDateInvalid = '';
    }
    if (startDate && startDate < today) {
      this.dateErrors.startDateInvalid = 'La data di partenza non può essere precedente ad oggi'
    } else {
      this.dateErrors.startDateInvalid = '';
    }
  }

  notValidForm() {
    return this.dateErrors.startDateInvalid || this.dateErrors.endDateInvalid || this.notChangedValues();
  }

  private notChangedValues() {
    return this.travel.destination === this.selectedTravel.destination &&
      this.travel.startDate === this.selectedTravel.startDate &&
      this.travel.endDate === this.selectedTravel.endDate &&
      this.travel.price === this.selectedTravel.price &&
      this.travel.maxParticipantsNumber === this.selectedTravel.maxParticipantsNumber &&
      this.travel.description === this.selectedTravel.description;
  }

  private setTravel() {
    this.travel.destination = this.selectedTravel.destination;
    this.travel.startDate = this.selectedTravel.startDate;
    this.travel.endDate = this.selectedTravel.endDate;
    if (this.travel.price !== this.selectedTravel.price) {
      this.travel.oldPrice = this.travel.price;
    }
    this.travel.price = this.selectedTravel.price;
    this.travel.maxParticipantsNumber = this.selectedTravel.maxParticipantsNumber;
    this.travel.description = this.selectedTravel.description;
  }
}
