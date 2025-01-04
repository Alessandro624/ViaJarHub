import {Component, Inject, NgZone, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormsModule} from '@angular/forms';
import {AddTravelComponent} from '../../add-travel/add-travel.component';
import {ReviewComponent} from '../../review/review.component';

import {User} from '../../models/user/user.model';
import {ClientService} from '../client/client.service';
import {AuthenticationService} from '../../login/authentication.service';
import {ReviewService} from '../../review/review.service';
import {Review} from '../../models/review/review.module';
import {MakeAdminModalComponent} from '../../make-admin-modal/make-admin-modal.component';

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
    MakeAdminModalComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  @ViewChild(AddTravelComponent) addTravelComponent: AddTravelComponent | undefined;
  user: User | null | undefined
  // Valori finali
  finalDailyIncome = 102;
  finalMonthlyIncome = 102;
  finalYearlyIncome = 102;
  finalTotalIncome = 102;
  // Valori animati
  dailyIncome = 0;
  monthlyIncome = 0;
  yearlyIncome = 0;
  totalIncome = 0;
  data = [
    {label: 'Gen', value: 120},
    {label: 'Feb', value: 80},
    {label: 'Mar', value: 150},
    {label: 'Apr', value: 200},
    {label: 'Mag', value: 170},
    {label: 'Giu', value: 170},
    {label: 'Lug', value: 170},
    {label: 'Ago', value: 170},
    {label: 'Set', value: 80},
    {label: 'Ott', value: 150},
    {label: 'Nov', value: 200},
    {label: 'Dec', value: 170},
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

  constructor(@Inject(NgZone) private ngZone: NgZone, private _clientService: ClientService, private _authenticationService: AuthenticationService, private reviewService: ReviewService) {
  }

  ngOnInit(): void {
    this.setUser();
    this.showProfileImage();
    this.showBirthdate();
    this.initializeAnimation();
    this.animateValues();
    this.loadReviews();
  }

  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        if (data) {
          this.user = data;
        }
      }, error: error => console.log(error)
    });
  }

  private showBirthdate() {
    if (this.user) {
      if (this.user.birthDate) {
        const birthDateObj = new Date(this.user.birthDate);
        this.birthdate = birthDateObj.toLocaleDateString('it-IT');
      }
      console.log(this.birthdate);
    }
  }

  private showProfileImage() {
    this._clientService.getUserProfileImage().subscribe({
      next: data => {
        this.profileImageUrl = URL.createObjectURL(data);
      },
      error: error => {
        console.log(error);
      }
    })
  }

  private loadReviews() {
    this.reviewService.getAllReviews().subscribe({
      next: data => {
        this.reviews = data.reverse();
        this.aggiornaRecensioniVisibili();
      }
    });
  }

  private initializeAnimation(): void {
    this.animatedData = this.data.map(() => 0); // Inizializza tutti i valori a 0
    this.animateBars();
  }

  private animateBars(): void {
    const duration = 2000; // Durata totale dell'animazione in millisecondi
    const steps = 60; // Numero di frame dell'animazione
    const interval = duration / steps; // Intervallo tra ogni frame
    const increments = this.data.map(bar => bar.value / steps); // Incremento per ogni barra
    let currentStep = 0;
    const intervalId = this.ngZone.runOutsideAngular(() => setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(intervalId); // Ferma l'animazione quando completa
        this.ngZone.run(() => {
          this.animatedData = this.data.map(bar => bar.value); // Imposta i valori finali
        });
        return;
      }
      this.ngZone.run(() => {
        this.animatedData = this.animatedData.map((value, index) =>
          Math.min(value + increments[index], this.data[index].value)
        );
      });
      currentStep++;
    }, interval));
  }

  private animateValues(): void {
    const duration = 2000; // Durata dell'animazione in millisecondi
    const steps = 60; // Numero di frame
    const interval = duration / steps;
    // Calcola gli incrementi per ciascun valore
    const dailyIncrement = this.finalDailyIncome / steps;
    const monthlyIncrement = this.finalMonthlyIncome / steps;
    const yearlyIncrement = this.finalYearlyIncome / steps;
    const totalIncrement = this.finalTotalIncome / steps;
    let currentStep = 0;
    const intervalId = this.ngZone.runOutsideAngular(() => setInterval(() => {
      if (currentStep >= steps) {
        // Ferma l'animazione e imposta i valori finali
        clearInterval(intervalId);
        this.ngZone.run(() => {
          this.dailyIncome = this.finalDailyIncome;
          this.monthlyIncome = this.finalMonthlyIncome;
          this.yearlyIncome = this.finalYearlyIncome;
          this.totalIncome = this.finalTotalIncome;
        });
        return;
      }
      // Aggiorna i valori incrementandoli
      this.ngZone.run(() => {
        this.dailyIncome += dailyIncrement;
        this.monthlyIncome += monthlyIncrement;
        this.yearlyIncome += yearlyIncrement;
        this.totalIncome += totalIncrement;

        // Arrotonda i valori per evitare decimali
        this.dailyIncome = Math.round(this.dailyIncome);
        this.monthlyIncome = Math.round(this.monthlyIncome);
        this.yearlyIncome = Math.round(this.yearlyIncome);
        this.totalIncome = Math.round(this.totalIncome);
      });
      currentStep++;
    }, interval));
  }

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
    this.addTravelComponent?.resetData();
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

  private aggiornaRecensioniVisibili() {
    this.recensioniVisibili = this.reviews.slice(this.startIndex, this.startIndex + this.step);
    this.loadBtnless = this.startIndex != 0;
    this.loadBtnmore = this.startIndex + this.step < this.reviews.length;
  }

  openPopupMakeAdmin() {
    this.isMakeAdminVisible = true;
  }

  closeMakeAdminPopup() {
    this.isMakeAdminVisible = false;
  }
}
