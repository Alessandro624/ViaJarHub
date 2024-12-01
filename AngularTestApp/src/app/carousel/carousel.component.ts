import {OnInit, Component} from '@angular/core';
import {AppComponent} from '../app.component';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent implements OnInit {
  constructor(private _appComponent: AppComponent) {
  }

  ngOnInit(): void {
    this._appComponent.typeWriterEffect();
  }
}
