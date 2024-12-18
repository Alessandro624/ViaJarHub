import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClientModule, HttpClient, HttpHeaders} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule], // Importa i moduli richiesti
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();

  @Input() prezzo: number = 0;
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  amount: number = this.prezzo;

  // Stato del pagamento
  loading: boolean = false;
  paymentSuccess: boolean = false;

  ngOnInit(): void {
  }

  makePayment() {

  }
}
