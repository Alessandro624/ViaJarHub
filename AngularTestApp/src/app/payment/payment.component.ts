import {Component, EventEmitter, input, Input, OnInit, Output} from '@angular/core';
import {HttpClientModule, HttpClient, HttpHeaders} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Travel} from '../models/travel/travel.module';
import {AuthenticationService} from '../login/authentication.service';
import {PaymentService} from './payment.service';


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
  @Input() travel: Travel | undefined;
  @Input() numeroPartecipanti: number = 0;
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  stripe: any;
  isLoading: boolean = false;


  constructor(private authentication: AuthenticationService, private payment: PaymentService) {
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
    this.payment.makePayment(paymentData)
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
