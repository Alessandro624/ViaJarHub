import {Component, OnInit} from '@angular/core';
import {Travel} from '../../models/travel/travel.model';
import {TravelService} from '../../travel.service';
import {ActivatedRoute} from '@angular/router';
import {ReviewComponent} from '../../review/review.component';

@Component({
  selector: 'app-infotravel',
  standalone: true,
  imports: [
    ReviewComponent
  ],
  templateUrl: './infotravel.component.html',
  styleUrl: './infotravel.component.css'
})
export class InfotravelComponent implements OnInit {
  travel!: Travel | undefined;

  constructor(private travelservice: TravelService, private _activatedRoute: ActivatedRoute,) {
  }

  ngOnInit() {
    const id = Number(this._activatedRoute.snapshot.paramMap.get('id'));
    if (id == null) {
      throw new Error("Viaggio non trovato");

    }
    this.travel = this.travelservice.getTravelById(id);

  }
}

