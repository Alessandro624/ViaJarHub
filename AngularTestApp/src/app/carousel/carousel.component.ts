import {AfterViewInit, Component, Inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';




@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements AfterViewInit  {
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
