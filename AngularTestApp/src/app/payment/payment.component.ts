import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {Travel} from '../models/travel/travel.model';
import {AuthenticationService} from '../login/authentication.service';
import {PaymentService} from './payment.service';


@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent {
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


  // Stato del pagamento
  loading: boolean = false;
  paymentSuccess: boolean = false;
  private APIUrl = "api";


  constructor(private _http: HttpClient, private authentication: AuthenticationService) {
  }

  makePayment() {
    this.isLoading = true;
    const paymentData = {
      cardNumber: this.cardNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv,
      amount: this.prezzo,
      destinazione: this.travel?.destinazione,
      dataPartenza: this.travel?.dataPartenza,
      dataRitorno: this.travel?.dataRitorno,
      numeroPartecipanti: this.numeroPartecipanti,
      email: this.authentication.currentUserSubject.getValue()?.email

    };
    console.log(this.prezzo);


    // Invio dati al backend
    this._http.post(`${this.APIUrl}/auth/v1/payment`, paymentData)
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
}
