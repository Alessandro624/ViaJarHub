import { Component, ViewChild, ElementRef, HostListener, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  isHeaderWhite = true;
  scrollThreshold = 0;

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;


  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object // Per identificare l'ambiente
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/body2') {
          this.isHeaderWhite = true;
        } else if (isPlatformBrowser(this.platformId)) {
          // Accedi a window solo se sei sul browser
          this.updateScrollThreshold();
          this.isHeaderWhite = window.scrollY > this.scrollThreshold;
        }
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateScrollThreshold();
      this.typeWriterEffect();

    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (isPlatformBrowser(this.platformId) && this.router.url === '/body1') {
      this.isHeaderWhite = window.scrollY > this.scrollThreshold;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateScrollThreshold();
    }
  }

  updateScrollThreshold() {
    if (this.carousel && isPlatformBrowser(this.platformId)) {
      this.scrollThreshold = this.carousel.nativeElement.offsetHeight || 100;
    }
  }
  typeWriterEffect() {
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
  }
}
