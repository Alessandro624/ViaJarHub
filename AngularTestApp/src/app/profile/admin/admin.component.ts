import {Component, Inject, NgZone, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormsModule} from '@angular/forms';
import {AddTravelComponent} from '../../add-travel/add-travel.component';
import {ReviewComponent} from '../../review/review.component';

import {User} from '../../models/user/user.model';
import {ClientService} from '../client/client.service';
import {AuthenticationService} from '../../login/authentication.service';
import {ReviewService} from '../../review/review.service';
import {Review} from '../../models/review/review.model';
import {MakeAdminModalComponent} from '../../make-admin-modal/make-admin-modal.component';
import {ReviewmodalComponent} from '../../review/reviewmodal/reviewmodal.component';
import {TravelService} from '../../travel-detail/travel.service';
import {Travel} from '../../models/travel/travel.model';
import {StarComponent} from '../../star/star.component';
import {PaymentService} from '../../payment/payment.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    AddTravelComponent,
    NgClass,
    NgStyle,
    ReviewComponent,
    NgIf,
    MakeAdminModalComponent,
    ReviewmodalComponent,
    StarComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  @ViewChild(AddTravelComponent) addTravelComponent: AddTravelComponent | undefined;
  user: User | null | undefined
  // Valori finali
  finalDailyIncome = 0;
  finalMonthlyIncome = 0;
  finalYearlyIncome = 0;
  finalTotalIncome = 0;

  // Valori animati
  dailyIncome = 0;
  monthlyIncome = 0;
  yearlyIncome = 0;
  totalIncome = 0;

  numrec = 0;

  data = [
    {label: 'Gen', value: 0},
    {label: 'Feb', value: 0},
    {label: 'Mar', value: 0},
    {label: 'Apr', value: 0},
    {label: 'Mag', value: 0},
    {label: 'Giu', value: 0},
    {label: 'Lug', value: 0},
    {label: 'Ago', value: 0},
    {label: 'Set', value: 0},
    {label: 'Ott', value: 0},
    {label: 'Nov', value: 0},
    {label: 'Dec', value: 0},
  ];
  animatedData: number[] = [];
  profileImageUrl: string = '';
  birthdate: String | undefined;
  isPopupVisible = false;
  isMakeAdminVisible = false;
  reviews: Review[] = [];
  recensioniVisibili: Review[] = [];
  loadBtnless = false;
  loadBtnmore = false;
  step: number = 3;
  startIndex: number = 0;
  mostRated: Travel[] = [];
  starRatings: Map<number, number> = new Map();
  numTravel = 0;
  isPopupVisible4: boolean = false;
  selectReview: Review | null = null;
  maxVal: number = 0;

  constructor(@Inject(NgZone) private ngZone: NgZone, private _clientService: ClientService, private _authenticationService: AuthenticationService, private reviewService: ReviewService, private travelService: TravelService, private paymentService: PaymentService) {
  }

  ngOnInit(): void {
    this.setUser();
    this.showProfileImage();
    this.showBirthdate();
    this.getReviews();
    this.getMostRated();
    this.getTravelNumber();
    this.getDailyIncome();
    this.getMonthlyIncome();
    this.getAnnualIncome();
    this.getAllIncome();
    this.fetchMonthlyBookings();

  }

  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        if (data) {
          this.user = data;
        }
      }
    });
  }

  private showBirthdate() {
    if (this.user) {
      if (this.user.birthDate) {
        const birthDateObj = new Date(this.user.birthDate);
        this.birthdate = birthDateObj.toLocaleDateString('it-IT');
      }
    }
  }

  private showProfileImage() {
    this._clientService.getUserProfileImage().subscribe({
      next: data => {
        this.profileImageUrl = URL.createObjectURL(data);
      }
    });
  }

  private getReviews() {
    this.reviewService.getAllReviews().subscribe({
      next: data => {
        this.reviews = data.reverse();
        this.numrec = this.reviews.length;
        this.aggiornaRecensioniVisibili();
      }
    });
  }

  private getMostRated() {
    this.travelService.getMostRated().subscribe({
      next: data => {
        this.mostRated = data.reverse();
        this.calculateStars();

      }
    });
  }

  private getTravelNumber() {
    this.travelService.getTravelNumber().subscribe({
      next: data => {
        this.numTravel = data;
      }
    });
  }

  private fetchMonthlyBookings() {
    for (let month = 1; month <= 12; month++) {
      this.paymentService.getMonthlyBooking(month).subscribe({
        next: booking => {
          this.data[month - 1].value = booking;
          if (month === 12) {
            this.initializeAnimation();
          }
        }
      });
    }
  }

  private getDailyIncome() {
    this.paymentService.getDailyIncome().subscribe({
      next: data => {
        this.finalDailyIncome = data;
        this.animateValue('dailyIncome', this.finalDailyIncome);
      }
    });
  }

  private getMonthlyIncome() {
    this.paymentService.getMonthlyIncome().subscribe({
      next: data => {
        this.finalMonthlyIncome = data;
        this.animateValue('monthlyIncome', this.finalMonthlyIncome);
      }
    });
  }

  private getAnnualIncome() {
    this.paymentService.getAnnualIncome().subscribe({
      next: data => {
        this.finalYearlyIncome = data;
        this.animateValue('yearlyIncome', this.finalYearlyIncome);
      }
    });
  }

  private getAllIncome() {
    this.paymentService.getAllIncome().subscribe({
      next: data => {
        this.finalTotalIncome = data;
        this.animateValue('totalIncome', this.finalTotalIncome);
      }
    });
  }

  // Metodo per inizializzare l'animazione
  private initializeAnimation(): void {
    this.maxVal = Math.max(...this.data.map(d => d.value));
    this.animatedData = this.data.map(() => 0); // Inizializza tutti i valori a 0
    this.animateBars();
  }

  // Animazione incrementale dei valori
  private animateBars(): void {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const increments = this.data.map(bar => bar.value / steps);
    let currentStep = 0;
    const intervalId = this.ngZone.runOutsideAngular(() => setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(intervalId);
        this.ngZone.run(() => {
          this.animatedData = this.data.map(bar => bar.value);
        });
        return;
      }
      this.ngZone.run(() => {
        this.animatedData = this.animatedData.map((value, index) => Math.min(value + increments[index], this.data[index].value));
      });
      currentStep++;
    }, interval));
  }

  private animateValue(property: 'dailyIncome' | 'monthlyIncome' | 'yearlyIncome' | 'totalIncome', finalValue: number) {
    const duration = 2000; // Durata dell'animazione in millisecondi
    let steps = 60; // Numero di frame dell'animazione
    const interval = duration / steps; // Intervallo tra ogni frame
    if (finalValue < steps) {
      steps = finalValue; // Imposta gli step al valore finale se è minore di 60
    }
    const increment = Math.floor(finalValue / steps);
    let currentStep = 0;
    const intervalId = this.ngZone.runOutsideAngular(() => setInterval(() => {
      if (currentStep >= steps || this[property] + increment >= finalValue) {
        clearInterval(intervalId);
        this.ngZone.run(() => {
          this[property] = finalValue;
        });
        return;
      }
      this.ngZone.run(() => {
        this[property] = Math.min(this[property] + increment, finalValue);
      });
      currentStep++;
    }, interval));
  }

  private aggiornaRecensioniVisibili() {
    this.recensioniVisibili = this.reviews.slice(this.startIndex, this.startIndex + this.step);
    this.loadBtnless = this.startIndex != 0;
    this.loadBtnmore = this.startIndex + this.step < this.reviews.length;
  }

  private calculateStars(): void {
    this.mostRated.forEach((travel) => {
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

  lessReview() {
    if (this.startIndex - this.step >= 0) {
      this.startIndex -= this.step;
      this.aggiornaRecensioniVisibili();
    }
  }

  moreReview() {
    if (this.startIndex + this.step < this.reviews.length) {
      this.startIndex += this.step;
      this.aggiornaRecensioniVisibili();
    }
  }

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
    this.addTravelComponent?.resetData();
  }

  openPopupMakeAdmin() {
    this.isMakeAdminVisible = true;
  }

  closeMakeAdminPopup() {
    this.isMakeAdminVisible = false;
  }

  closePopup4() {
    this.isPopupVisible4 = false;
  }

  openPopup4(review: Review) {
    this.isPopupVisible4 = true;
    this.selectReview = review;
  }
}
