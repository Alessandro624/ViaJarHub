import {AfterViewInit, Component, Inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';

import {type} from 'node:os';
import {CarouselComponent} from '../carousel/carousel.component';
import {CardComponent} from '../card/card.component';

@Component({
  selector: 'app-body1',
  standalone: true,
  imports: [CommonModule, CarouselComponent, CardComponent],
  templateUrl: './body1.component.html',
  styleUrls: ['./body1.component.css']
})
export class Body1Component implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  typeWriterEffect() {
    if (isPlatformBrowser(this.platformId)){
    const textElement = document.getElementById('animatedText');
    const text = textElement?.textContent || '';
    textElement!.textContent = '';
    let index = 0;

    const type = () => {
      if (index < text.length) {
        textElement!.textContent += text.charAt(index);
        index++;
        setTimeout(type, 100); // Velocità di scrittura
      }
    };

    type();
  }}

  ngAfterViewInit(): void {
    this.typeWriterEffect();

  }
}
