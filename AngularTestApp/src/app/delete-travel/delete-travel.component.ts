import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from '../travel-detail/travel.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-delete-travel',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './delete-travel.component.html',
  styleUrl: './delete-travel.component.css'
})
export class DeleteTravelComponent {
  @Input() travel!: Travel;
  @Output() closeDeleteTravel = new EventEmitter<void>();
  @Output() localDeleteTravel = new EventEmitter<void>();
  isLoading: boolean = false;
  alertMessage: string = '';

  constructor(private _travelService: TravelService) {
  }

  deleteTravel() {
    this.isLoading = true;
    this.alertMessage = '';
    this._travelService.deleteTravel(this.travel.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.localDeleteTravel.emit();
          alert("Viaggio eliminato con successo");
          this.closeDeleteTravel.emit();
        }, error: error => {
          this.isLoading = false;
          this.alertMessage = error.message;
        }
      }
    );
  }
}
