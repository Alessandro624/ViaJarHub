import {Component, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormsModule} from '@angular/forms';
import {AddTravelComponent} from '../../add-travel/add-travel.component';
import {ReviewComponent} from '../../review/review.component';
import {User} from '../../models/user/user.model';
import {ClientService} from '../client/client.service';
import {AuthenticationService} from '../../login/authentication.service';

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
    NgIf
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  @ViewChild(AddTravelComponent) addTravelComponent: AddTravelComponent | undefined;
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
  user!: User;
  profileImageUrl: string = '';
  birthdate: String | undefined;
  isPopupVisible = false;

  constructor(private _clientService: ClientService, private _authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.setUser();
    this.showProfileImage();
    this.showBirthdate();
    this.initializeAnimation();
    this.animateValues();

  }

  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        if (data) {
          this.user = data;
          console.log(this.user);
        }
      }, error: error => console.log(error)
    });
  }

  private showBirthdate() {
    if (this.user.birthDate) {
      const birthDateObj = new Date(this.user.birthDate);
      this.birthdate = birthDateObj.toLocaleDateString('it-IT');
    }
    console.log(this.birthdate);
  }

  private showProfileImage() {
    this._clientService.getUserProfileImage().subscribe(
      {
        next: data => {
          this.profileImageUrl = URL.createObjectURL(data);
        },
        error: error => {
          console.log(error);
        }
      }
    )
  }

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
    this.addTravelComponent?.resetData();
  }

  // Metodo per inizializzare l'animazione
  initializeAnimation(): void {
    this.animatedData = this.data.map(() => 0); // Inizializza tutti i valori a 0
    this.animateBars();
  }

  // Animazione incrementale dei valori
  animateBars(): void {
    const duration = 1000; // Durata totale dell'animazione in millisecondi
    const steps = 60; // Numero di frame dell'animazione
    const interval = duration / steps; // Intervallo tra ogni frame

    const increments = this.data.map(bar => bar.value / steps); // Incremento per ogni barra

    let currentStep = 0;

    const intervalId = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(intervalId); // Ferma l'animazione quando completa
        this.animatedData = this.data.map(bar => bar.value); // Imposta i valori finali
        return;
      }

      this.animatedData = this.animatedData.map((value, index) =>
        Math.min(value + increments[index], this.data[index].value)
      );

      currentStep++;
    }, interval);
  }

  animateValues(): void {
    const duration = 1000; // Durata dell'animazione in millisecondi
    const steps = 60; // Numero di frame
    const interval = duration / steps;

    // Calcola gli incrementi per ciascun valore
    const dailyIncrement = this.finalDailyIncome / steps;
    const monthlyIncrement = this.finalMonthlyIncome / steps;
    const yearlyIncrement = this.finalYearlyIncome / steps;
    const totalIncrement = this.finalTotalIncome / steps;

    let currentStep = 0;

    const intervalId = setInterval(() => {
      if (currentStep >= steps) {
        // Ferma l'animazione e imposta i valori finali
        clearInterval(intervalId);
        this.dailyIncome = this.finalDailyIncome;
        this.monthlyIncome = this.finalMonthlyIncome;
        this.yearlyIncome = this.finalYearlyIncome;
        this.totalIncome = this.finalTotalIncome;
        return;
      }

      // Aggiorna i valori incrementandoli
      this.dailyIncome += dailyIncrement;
      this.monthlyIncome += monthlyIncrement;
      this.yearlyIncome += yearlyIncrement;
      this.totalIncome += totalIncrement;

      // Arrotonda i valori per evitare decimali
      this.dailyIncome = Math.round(this.dailyIncome);
      this.monthlyIncome = Math.round(this.monthlyIncome);
      this.yearlyIncome = Math.round(this.yearlyIncome);
      this.totalIncome = Math.round(this.totalIncome);

      currentStep++;
    }, interval);
  }

}
