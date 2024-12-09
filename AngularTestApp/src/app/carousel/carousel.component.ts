import { OnInit, OnDestroy, Component, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { AppComponent } from '../app.component';
import {isPlatformBrowser, NgClass} from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  imports: [
    NgClass
  ],
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  inBody: boolean = false; // Stato per indicare se è in Body1

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _appComponent: AppComponent,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Controlla se il componente è contenuto all'interno di Body1
    this.inBody = this.isContainedIn('app-body1');

    // Configura il carosello con l'intervallo appropriato
    const interval = this.inBody ? 5000 : 20000; // 5 secondi dentro Body1, 20 secondi fuori
    this.enableCarouselTimer(interval);

    // Esegui l'effetto macchina da scrivere solo dentro Body1
    if (this.inBody) {
      this._appComponent.typeWriterEffect();
    }
  }

  ngOnDestroy(): void {
    // Pulisci le risorse del carosello
    const carouselElement = this.elementRef.nativeElement.querySelector('#carouselExample');
    if (carouselElement && isPlatformBrowser(this.platformId)) {
      const bootstrap = (window as any).bootstrap;
      const carouselInstance = bootstrap?.Carousel.getInstance(carouselElement);
      if (carouselInstance) {
        carouselInstance.dispose();
      }
    }
  }

  // Funzione per verificare se il componente è contenuto in un altro componente
  private isContainedIn(parentSelector: string): boolean {
    let parent = this.elementRef.nativeElement.parentElement;
    while (parent) {
      if (parent.tagName.toLowerCase() === parentSelector.toLowerCase()) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  // Abilita il timer del carosello con un intervallo specifico
  private enableCarouselTimer(interval: number): void {
    const carouselElement = this.elementRef.nativeElement.querySelector('#carouselExample');
    if (carouselElement && isPlatformBrowser(this.platformId)) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap) {
        bootstrap.Carousel.getOrCreateInstance(carouselElement, {
          interval: interval, // Imposta l'intervallo dinamicamente
          wrap: true          // Consente il ciclo delle immagini
        });
      }
    }
  }
}
