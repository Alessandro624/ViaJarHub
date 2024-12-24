import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from './travel.service';
import {FormsModule} from '@angular/forms';
import {NgClass, NgStyle} from '@angular/common';
import {PaymentComponent} from '../payment/payment.component';
import {AuthenticationService} from '../login/authentication.service';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    FormsModule,
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

  constructor(private _travelService: TravelService, private _activatedRoute: ActivatedRoute, private authentication: AuthenticationService) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    if (id == null) {
      throw new Error("Viaggio non trovato");
    }
    this.travel = this._travelService.getTravelById(id);
    this.modificaPrezzo();
  }

  modificaPrezzo() {
    if (this.travel) {
      this.prezzoFinale = this.travel.prezzo * this.postiSelezionati;
    }

  }

  openPopup() {
    if (this.authentication.currentUserSubject.getValue()) {
      this.isPopupVisible = true;
    } else {
      alert("Attenzione:\nPer prenotare devi accedere al sistema!");
    }

  }

  closePopup() {
    this.isPopupVisible = false;
  }

}
