import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from './travel.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import {PaymentComponent} from '../payment/payment.component';
import {AuthenticationService} from '../login/authentication.service';
import {WishlistService} from '../wishlist/wishlist.service';
import {PaymentService} from '../payment/payment.service';
import {tap} from 'rxjs';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    FormsModule,
    NgClass,
    NgStyle,
    PaymentComponent,
    NgIf
  ],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.css'
})
export class TravelDetailComponent implements OnInit {
  travel!: Travel | undefined;
  postiSelezionati: number = 1;
  prezzoFinale: number = 0;
  isPopupVisible: boolean = false;
  isInWishlist: boolean = false;
  availableSeats: number = 0;
  isInBooking: boolean = false;
  type = ''

  constructor(private _paymentService: PaymentService, private _wishlistService: WishlistService, private _travelService: TravelService, private _activatedRoute: ActivatedRoute, private authentication: AuthenticationService, private _alertService: AlertService) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    if (id == null) {
      throw new Error("Viaggio non trovato");
    }
    this.setTravel(id);
    this.checkIsInWishlist(id);
  }

  modificaPrezzo() {
    if (this.travel) {
      this.prezzoFinale = this.travel.price * this.postiSelezionati;
    }
  }

  openPopup() {
    if (this.authentication.currentUserSubject.getValue()) {
      if (this.postiSelezionati <= this.availableSeats) {
        this.isPopupVisible = true;
      } else {
        this._alertService.showAlert("Numero di posti superiore a quelli disponibili", false)
      }
    } else {
      this._alertService.showAlert("Attenzione:\nPer prenotare devi accedere al sistema!", false);
    }
  }

  closePopup() {
    this.isPopupVisible = false;
    this.setAvailableSeats(this.travel!);
  }

  addToWishlist() {
    this._wishlistService.addToWishlist(this.travel!.id).subscribe({
        next: () => {
          this._alertService.showAlert("Added", true);
        }, error: error => {
          this._alertService.showAlert(error.message, false);
          console.log(error);
        }
      }
    )
  }

  checkIsInWishlist(id: number) {
    this._wishlistService.wishlist$.subscribe({
      next: result => {
        this.isInWishlist = (!!result) && result.filter(item => item.id === id).length > 0;
      }, error: error => {
        console.log(error);
        this.isInWishlist = false;
      }
    });
  }

  removeFromWishlist() {
    this._wishlistService.removeFromWishlist(this.travel!.id).subscribe({
      next: (result) => {
        this._alertService.showAlert("Removed", true);
        console.log(result);
      },
      error: error => {
        console.log(error);
      }
    });
  }

  private setTravel(id: number) {
    this._travelService.getTravelById(id).subscribe({
      next: result => {

        this.travel = result;
        this.type = this.travel.travelType.toLowerCase();
        this.modificaPrezzo();
        this.setAvailableSeats(result);
        this.checkIsInBooking(id, this.travel.startDate, this.travel.endDate);
      }
    });
  }

  private setAvailableSeats(travel: Travel) {
    this._travelService.getAvailableSeats(travel).subscribe({
      next: result => {
        this.availableSeats = result;
        this.postiSelezionati = 1;
      }
    })
  }

  private checkIsInBooking(id: number, startDate: string, endDate: string) {
    this._paymentService.booking$.subscribe({
      next: result => {
        this.isInBooking = (!!result) && result.filter(item => item.id === id && item.startDate === startDate && item.endDate === endDate).length > 0;
      }, error: error => {
        console.log(error);
        this.isInBooking = false;
      }
    });
  }

  protected readonly tap = tap;
}
