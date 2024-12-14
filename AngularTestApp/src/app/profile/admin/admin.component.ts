import {Component, OnInit} from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
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

  ngOnInit(): void {
    this.initializeAnimation();
    this.animateValues();

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
