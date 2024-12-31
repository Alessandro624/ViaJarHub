import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {PaymentComponent} from "../payment/payment.component";
import {RouterLink} from "@angular/router";
import {Travel} from '../models/travel/travel.model';
import {WishlistService} from './wishlist.service';
import {PaymentService} from '../payment/payment.service';


@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    NgForOf,
    PaymentComponent,
    RouterLink,
    NgClass,
    NgStyle,
    NgIf
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  isPaymentVisible: boolean = false;
  wishlist: Travel[] = [];
  currentWishlist: Travel[] = [];
  index: number = 0;
  wishlistLength: number = 0;
  isConfirmVisible: boolean = false;
  toRemoveTravel: Travel | null = null;

  constructor(private _paymentService: PaymentService, private _wishlistService: WishlistService) {
  }

  ngOnInit(): void {
    this.loadWishlist();
  }

  openPayment(id: number) {
    this._paymentService.booking$.subscribe({
      next: result => {
        if (!((!!result) && result.filter(item => item.id === id).length > 0)) {
          this.isPaymentVisible = true;
        } else {
          this.isPaymentVisible = false;
          alert("Viaggio già prenotato")
        }
      }, error: error => {
        console.log(error);
        this.isPaymentVisible = false;
      }
    });
  }

  closePayment() {
    this.isPaymentVisible = false;
  }

  removeFromWishlist(id: number) {
    this._wishlistService.removeFromWishlist(id).subscribe({
      next: () => {
        alert("Removed");
        this.toRemoveTravel = null;
        this.isConfirmVisible = false;
      },
      error: error => {
        console.log(error);
      }
    });
  }

  nextWishlist() {
    this.index += 3;
    this.setCurrentWishlist();
  }

  previewsWishlist() {
    this.index = Math.max(0, this.index - 3);
    this.setCurrentWishlist();
  }

  private setCurrentWishlist() {
    if (this.index + 3 > this.wishlist.length) {
      this.currentWishlist = this.wishlist.slice(this.index);
    } else {
      this.currentWishlist = this.wishlist.slice(this.index, this.index + 3);
    }
  }

  private resetWishlist() {
    this.wishlist = [];
    this.wishlistLength = 0;
    this.currentWishlist = [];
  }

  closeConfirm() {
    this.isConfirmVisible = false;
    this.toRemoveTravel = null;
  }

  confirmRemove(travel: Travel) {
    this.isConfirmVisible = true;
    this.toRemoveTravel = travel;
  }

  private loadWishlist() {
    this._wishlistService.wishlist$.subscribe({
        next: data => {
          if (data) {
            this.wishlist = data;
            this.wishlistLength = this.wishlist.length - 3;
            this.setCurrentWishlist();
          } else {
            this.resetWishlist();
          }
        }, error: error => {
          console.log(error);
          this.resetWishlist();
        }
      }
    );
  }
}
