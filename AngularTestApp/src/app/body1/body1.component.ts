import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CarouselComponent} from '../carousel/carousel.component';
import {CardComponent} from '../card/card.component';
import {AppComponent} from '../app.component';
import {FiltriComponent} from '../filtri/filtri.component';

@Component({
  selector: 'app-body1',
  standalone: true,
  imports: [CommonModule, CarouselComponent, CardComponent, FiltriComponent],
  templateUrl: './body1.component.html',
  styleUrls: ['./body1.component.css']
})

export class Body1Component implements OnInit {
  constructor(private _appComponent: AppComponent) {
  }

  ngOnInit(): void {
    this._appComponent.typeWriterEffect();
  }
}
