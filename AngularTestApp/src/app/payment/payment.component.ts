import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input, NgZone,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Travel} from '../models/travel/travel.model';
import {AuthenticationService} from '../login/authentication.service';
import {PaymentService} from './payment.service';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnChanges {
  @Input() prezzo: number = 0;
  @Input() travel: Travel | undefined;
  @Input() numeroPartecipanti: number = 0;
  @Output() closeModal = new EventEmitter<void>();
  cardNumber: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  cvv: string = '';
  stripe: any;
  isLoading: boolean = false;
  inWishlist: boolean = false;
  postiSelezionati: number = 1;
  prezzoFinale: number = 0;

  constructor(@Inject(NgZone) private ngZone: NgZone, private _paymentService: PaymentService, private authentication: AuthenticationService, private elementRef: ElementRef, private alertService: AlertService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.ngZone.runOutsideAngular(() => {
        this.modificaPrezzo();
        this.inWishlist = this.isContainedIn('app-client');
      });
    }
  }

  makePayment() {
    this.isLoading = true;
    const paymentData = this.getPaymentData();
    this._paymentService.makePayment(paymentData).subscribe({
      next: () => {
        this.alertService.showAlert('Pagamento riuscito', true);
        this.isLoading = false;
        this.closeModal.emit();
      }, error: () => {
        this.alertService.showAlert('Errore durante il pagamento.', false);
        this.isLoading = false;
        this.closeModal.emit();
      }
    });
  }

  private isContainedIn(parentSelector: string): boolean {
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
    if (this.travel) {
      this.prezzoFinale = this.travel.price * this.postiSelezionati;
    }
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

  private getPaymentData() {
    return {
      cardNumber: this.cardNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cvv: this.cvv,
      amount: this.prezzoFinale,
      destinazione: this.travel?.destination,
      dataPartenza: this.travel?.startDate,
      dataRitorno: this.travel?.endDate,
      numeroPartecipanti: this.numeroPartecipanti,
      email: this.authentication.currentUserSubject.getValue()?.email,
      travelId: this.travel?.id
    };
  }
}
