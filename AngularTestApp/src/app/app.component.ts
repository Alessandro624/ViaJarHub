import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  Inject,
  PLATFORM_ID,
  OnInit
} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Router, NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  isHeaderWhite = true;
  scrollThreshold = 0;

  @ViewChild('carousel', {static: false}) carousel!: ElementRef;

  constructor(private _router: Router, @Inject(PLATFORM_ID) private _platformId: object) {
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.handleRouteChange(event.url);
      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this._platformId)) {
      this.updateScrollThreshold();
      this.typeWriterEffect();
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (this.isBrowser() && this._router.url === '/body1') {
      this.isHeaderWhite = window.scrollY > this.scrollThreshold;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    if (this.isBrowser()) {
      this.updateScrollThreshold();
    }
  }

  updateScrollThreshold() {
    if (this.carousel && this.isBrowser()) {
      this.scrollThreshold = this.carousel.nativeElement.offsetHeight || 100;
    }
  }

  public typeWriterEffect() {
    const textElement = document.getElementById('animatedText');
    if (!textElement) {
      return;
    }
    const text = textElement.textContent || '';
    textElement.textContent = '';
    let index = 0;
    const type = () => {
      if (index < text.length) {
        textElement.textContent += text.charAt(index);
        index++;
        requestAnimationFrame(type); // animazione più fluida
      }
    };
    type();
  }

  private isBrowser() {
    return isPlatformBrowser(this._platformId);
  }

  private handleRouteChange(url: string): void {
    if (url === '/body2') {
      this.isHeaderWhite = true;
    } else if (this.isBrowser()) {
      this.updateScrollThreshold();
      this.isHeaderWhite = window.scrollY > this.scrollThreshold;
    }
  }
}
