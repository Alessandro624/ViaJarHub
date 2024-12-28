import {Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import {TravelService} from '../travel-detail/travel.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Travel} from '../models/travel/travel.model';
import {FormsModule} from '@angular/forms';
import {TravelFilter} from '../models/travel/travel-filter.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  imports: [
    NgClass,
    NgIf,
    FormsModule,
    NgForOf
  ],
  styleUrls: ['./carousel.component.css']
})

export class CarouselComponent implements OnInit, OnDestroy {
  inBody: boolean = false; // Stato per indicare se è in Body1
  isFocused: boolean = false; // Controlla se la barra è illuminata

  travel!: Travel | undefined;
  immaginiURLs: string[] = [];
  isExpanded: boolean = false;

  filters: TravelFilter = {
    searchQuery: '',
    startDate: '',
    endDate: '',
    minPrice: 0,
    maxPrice: 0,
    travelType: null,
    travelOrder: null,
    reverse: false,
  }

  suggestions: string[] = [];

  constructor(private _router: Router, private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object, private elementRef: ElementRef, private _travelService: TravelService, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    // Controlla se il componente è contenuto all'interno di Body1
    this.inBody = this.isContainedIn('app-body1');

    // Configura il carosello con l'intervallo appropriato
    const interval = this.inBody ? 5000 : 20000; // 5 secondi dentro Body1, 20 secondi fuori
    this.enableCarouselTimer(interval);

    // Esegui l'effetto macchina da scrivere solo dentro Body1
    if (this.inBody) {
      this.ngZone.runOutsideAngular(() => this.typeWriterEffect());
    } else {

      const id = Number(this._activatedRoute.parent?.snapshot.paramMap.get('id'));
      if (id == null) {
        throw new Error("Viaggio non trovato");

      }
      this._travelService.getTravelById(id).subscribe({
        next: result => {
          this.travel = result;
          this._travelService.getTravelImages(this.travel.id).subscribe({
            next: data => {
              console.log(data);
              this.immaginiURLs = data.map(image => `data:image/jpeg;base64,${image}`);
            }
          });
        }
      });
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

    this.immaginiURLs.forEach(url => URL.revokeObjectURL(url));

  }

  typeWriterEffect() {
    if (isPlatformBrowser(this.platformId)) {
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

  // Funzione per verificare se il componente è contenuto in un altro componente
  isContainedIn(parentSelector: string): boolean {
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
  enableCarouselTimer(interval: number): void {
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


  expandSearchBar(): void {
    this.isExpanded = true;
    this.isFocused = true;
  }

  collapseSearchBar(): void {
    if (!this.filters.searchQuery) {
      this.isExpanded = false;
      this.isFocused = false;
    }
  }

  onSearch(): void {
    if (this.isExpanded) {
      /*this._homeComponent.resetTravels();
      this._homeComponent.setSearchQuery(this.filters.searchQuery);
      this._homeComponent.loadTravels();*/
      this._router.navigate(['body1'], {queryParams: {search: this.filters.searchQuery}}).then();
    }
  }

  getAutocompleteSuggestions() {
    if (this.filters.searchQuery.length > 2) {
      this._travelService.getSuggestions(this.filters).subscribe({
        next: result => {
          this.suggestions = result;
        }, error: error => {
          this.suggestions = [];
          console.log(error);
        }
      });
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: string) {
    this.filters.searchQuery = suggestion;
    // this._homeComponent.setSearchQuery(this.filters.searchQuery);
    this.suggestions = [];
  }
}
