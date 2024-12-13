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

  }

  ngOnInit() {
    if (isPlatformBrowser(this._platformId)) {
      this.typeWriterEffect();
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


}
