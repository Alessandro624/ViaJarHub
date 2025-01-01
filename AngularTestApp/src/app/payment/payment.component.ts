import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Travel} from '../models/travel/travel.model';
import {AuthenticationService} from '../login/authentication.service';
import {PaymentService} from './payment.service';
import {response} from 'express';


@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnChanges {
  @Output() closeModal = new EventEmitter<void>();

  @Input() prezzo: number = 0;
  @Input() travel: Travel | undefined;
  @Input() numeroPartecipanti: number = 0;
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  stripe: any;
  isLoading: boolean = false;
  inWishlist: boolean = false;
  postiSelezionati: number = 1;
  prezzoFinale: number = 0;


  // Stato del pagamento
  constructor(private _paymentService: PaymentService, private authentication: AuthenticationService, private elementRef: ElementRef) {
  }

  makePayment() {
    this.isLoading = true;
    const paymentData = {
      cardNumber: this.cardNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv,
      amount: this.prezzo,
      destinazione: this.travel?.destination,
      dataPartenza: this.travel?.startDate,
      dataRitorno: this.travel?.endDate,
      numeroPartecipanti: this.numeroPartecipanti,
      email: this.authentication.currentUserSubject.getValue()?.email,
      travelId: this.travel?.id
    };
    console.log(this.prezzo);
    // Invio dati al backend
    this._paymentService.makePayment(paymentData)
      .subscribe({
        next: (response: any) => {
          console.log('Pagamento completato:', response);
          alert('Pagamento riuscito');
          this.isLoading = false;
          this.closeModal.emit();
        }, error: (error) => {
          console.error('Errore durante il pagamento:', error);
          alert('Errore durante il pagamento.');
          this.isLoading = false;
          this.closeModal.emit();
        }
      });
  }

  isContainedIn(parentSelector: string): boolean {
    let parent = this.elementRef.nativeElement.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === parentSelector.toLowerCase()) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }


  modificaPrezzo() {
    console.log()
    if (this.travel) {
      this.prezzoFinale = this.travel.price * this.postiSelezionati;
      console.log(this.prezzoFinale
      )
    }
  }

  ngOnChanges(): void {
    this.modificaPrezzo();
    this.inWishlist = this.isContainedIn('app-client');
  }

  validateExpiryMonth() {
    if (this.expiryMonth !== null) {
      if (Number(this.expiryMonth) < 1) {
        this.expiryMonth = '1';
      } else if (Number(this.expiryMonth) > 12) {
        this.expiryMonth = '12';
      }
    }
  }

  validateExpiryYear() {
    if (this.expiryYear !== null) {
      if (Number(this.expiryYear) < 2024) {
        this.expiryYear = '2024';
      } else if (Number(this.expiryYear) > 2040) {
        this.expiryYear = '2040';
      }
    }
  }
}
