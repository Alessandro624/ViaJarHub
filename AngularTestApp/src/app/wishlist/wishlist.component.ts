import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {PaymentComponent} from "../payment/payment.component";
import {RouterLink} from "@angular/router";
import {Travel} from '../models/travel/travel.model';
import {WishlistService} from './wishlist.service';
import {TravelService} from '../travel-detail/travel.service';
import {StarComponent} from '../star/star.component';
import {AlertService} from '../alert/alert.service';
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
    NgIf,
    StarComponent
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
  selectedTravel: Travel | undefined;
  starRatings: Map<number, number> = new Map();
  bookingStatus = new Map<string, boolean>();

  constructor(private _wishlistService: WishlistService, private travelService: TravelService, private alertService: AlertService, private _paymentService: PaymentService) {
  }

  ngOnInit(): void {
    this._wishlistService.wishlist$.subscribe({
        next: data => {
          if (data) {
            this.wishlist = data;
            this.calculateStars();
            this.calculateBookingStatus();
            this.wishlistLength = this.wishlist.length - 3;
            this.setCurrentWishlist();
          } else {
            this.resetWishlist();
          }
        }, error: () => {
          this.resetWishlist();
        }
      }
    );
  }

  openPayment(travel: Travel): void {
    this.selectedTravel = travel;
    this.isPaymentVisible = true;
  }

  closePayment() {
    this.isPaymentVisible = false;
  }

  removeFromWishlist(id: number) {
    this._wishlistService.removeFromWishlist(id).subscribe({
      next: () => {
        this.alertService.showAlert("Removed", true);
        this.toRemoveTravel = null;
        this.isConfirmVisible = false;
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

  confirmRemove(travel: Travel) {
    this.isConfirmVisible = true;
    this.toRemoveTravel = travel;
  }


  closeConfirm() {
    this.isConfirmVisible = false;
    this.toRemoveTravel = null;
  }

  private calculateStars(): void {
    this.wishlist.forEach((travel) => {
      this.travelService.getStars(travel.id).subscribe({
        next: (rating: number) => {
          this.starRatings.set(travel.id, rating); // Salva il rating nella mappa
        },
        error: () => {
          this.starRatings.set(travel.id, 0); // Default a 0 in caso di errore
        },
      });
    });
  }

  getStar(id: number): number {
    return this.starRatings.get(id) || 0;
  }

  private calculateBookingStatus(): void {
    this._paymentService.booking$.subscribe({
      next: (result) => {
        if (result) {
          result.forEach((item: { id: number; startDate: string; endDate: string }) => {
            const key = this.createKey(item.id, item.startDate, item.endDate);
            this.bookingStatus.set(key, true);
          });
        }
      },
      error: () => {
        this.bookingStatus.clear();
      },
    });
  }

  isInBooking(id: number, startDate: string, endDate: string): boolean {
    const key = this.createKey(id, startDate, endDate);
    return this.bookingStatus.get(key) || false;
  }

  private createKey(id: number, startDate: string, endDate: string): string {
    return `${id}-${startDate}-${endDate}`;
  }
}
