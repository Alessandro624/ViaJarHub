import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClientModule, HttpClient, HttpHeaders} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {window} from 'rxjs';
import {response} from 'express';
import {loadStripe} from '@stripe/stripe-js';


@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Importa i moduli richiesti
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
  @Output() closeModal = new EventEmitter<void>();

  @Input() prezzo: number = 0;
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  stripe: any;


  // Stato del pagamento
  loading: boolean = false;
  paymentSuccess: boolean = false;
  private APIUrl = "api";


  constructor(private http: HttpClient) {
  }

  makePayment() {
    this.loading = true;

    const paymentData = {
      cardNumber: this.cardNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv,
      amount: this.prezzo
    };
    console.log(this.prezzo);

    // Invio dati al backend
    this.http.post(`${this.APIUrl}/auth/v1/payment`, paymentData)
      .subscribe({
        next: (response: any) => {
          console.log('Pagamento completato:', response);
          alert('pagamento riuscito');
          this.paymentSuccess = true;
          this.loading = false;
          this.closeModal.emit();
        },
        error: (error) => {
          console.error('Errore durante il pagamento:', error);
          alert('Errore durante il pagamento.');
          this.loading = false;
        }
      });
  }


}
