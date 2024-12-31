import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from './travel.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import {PaymentComponent} from '../payment/payment.component';
import {AuthenticationService} from '../login/authentication.service';
import {WishlistService} from '../wishlist/wishlist.service';

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

  constructor(private _wishlistService: WishlistService, private _travelService: TravelService, private _activatedRoute: ActivatedRoute, private authentication: AuthenticationService) {
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
      this.isPopupVisible = true;
    } else {
      alert("Attenzione:\nPer prenotare devi accedere al sistema!");
    }
  }

  closePopup() {
    this.isPopupVisible = false;
  }

  addToWishlist() {
    this._wishlistService.addToWishlist(this.travel!.id).subscribe({
        next: () => {
          alert("Added");
        }, error: error => {
          alert(error.message);
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
        alert("Removed");
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
        this.modificaPrezzo();
      }
    });
  }
}
