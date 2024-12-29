import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgStyle} from "@angular/common";
import {PaymentComponent} from "../payment/payment.component";
import {RouterLink} from "@angular/router";
import {Travel} from '../models/travel/travel.model';
import {WishlistService} from './wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    NgForOf,
    PaymentComponent,
    RouterLink,
    NgClass,
    NgStyle
  ],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  isPaymentVisible: boolean = false;
  wishlist: Travel[] | null = [];

  constructor(private _wishlistService: WishlistService) {
  }

  ngOnInit(): void {
    this._wishlistService.wishlist$.subscribe({
        next: data => {
          this.wishlist = data;
        }, error: error => {
          console.log(error);
        }
      }
    );
  }

  openPayment() {
    this.isPaymentVisible = true;
  }

  closePayment() {
    this.isPaymentVisible = false;
  }

  removeFromWishlist(id: number) {
    this._wishlistService.removeFromWishlist(id).subscribe({
      next: () => {
        alert("Removed");
      },
      error: error => {
        console.log(error);
      }
    });
  }
}
