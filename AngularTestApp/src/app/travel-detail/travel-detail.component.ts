import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Travel} from '../models/travel/travel.module';
import {TravelService} from '../travel.service';
import {FormsModule} from '@angular/forms';
import {AddTravelComponent} from '../add-travel/add-travel.component';
import {NgClass, NgStyle} from '@angular/common';
import {PaymentComponent} from '../payment/payment.component';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    FormsModule,
    AddTravelComponent,
    NgClass,
    NgStyle,
    PaymentComponent
  ],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.css'
})
export class TravelDetailComponent implements OnInit {
  travel!: Travel | undefined;
  postiSelezionati: number = 1;
  prezzoFinale: number = 0;
  isPopupVisible: boolean = false;

  constructor(private travelservice: TravelService, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    if (id == null) {
      throw new Error("Viaggio non trovato");

    }
    this.travel = this.travelservice.getTravelById(id);
    this.modificaPrezzo();


  }

  modificaPrezzo() {
    if (this.travel) {
      this.prezzoFinale = this.travel.prezzo * this.postiSelezionati;
    }

  }

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }

}
