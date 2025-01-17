import {Component, ElementRef, Inject, Input, NgZone, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgClass, NgForOf, NgIf} from '@angular/common';
import {TravelService} from '../travel-detail/travel.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Travel} from '../models/travel/travel.model';
import {FormsModule} from '@angular/forms';
import {TravelFilter} from '../models/travel/travel-filter.model';
import {environment} from '../../environments/environment';

declare function getRandomPhoto(resolution: string): string;

declare var window: any;

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  imports: [
    NgClass,
    NgIf,
    FormsModule,
    NgForOf,
  ],
  styleUrls: ['./carousel.component.css']
})

export class CarouselComponent implements OnInit, OnDestroy {
  @Input() filters?: TravelFilter;
  inBody: boolean = false;
  isFocused: boolean = false;
  inReview: boolean = false;
  selectedIndex: number = -1;
  travel!: Travel | undefined;
  immaginiURLs: string[] = [];
  isExpanded: boolean = false;
  suggestions: string[] = [];
  photos: string[] = ['assets/images/carousel_image1.jpg', 'assets/images/carousel_image2.jpg', 'assets/images/carousel_image3.jpg'];

  constructor(private _router: Router, @Inject(NgZone) private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object, private elementRef: ElementRef, private _travelService: TravelService, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    // Controlla se il componente è contenuto all'interno di Body1
    this.inBody = this.isContainedIn('app-body1');
    this.inReview = this.isContainedIn('app-reviewmodal');
    // Configura il carosello con l'intervallo appropriato: 5 secondi dentro Body1, 20 secondi fuori
    const interval = this.inBody ? 5000 : 20000;
    this.enableCarouselTimer(interval);
    if (this.inBody) {
      this.ngZone.runOutsideAngular(() => {
        this.loadCarouselImages();
        this.typeWriterEffect()
      });
      this.loadSearchQuery();
    } else {
      const id = Number(this._activatedRoute.parent?.snapshot.paramMap.get('id'));
      this.loadTravel(id);
    }
  }

  private loadCarouselImages(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.configureFlickerAPIKey();
      this.fetchFlickerPhotos();
    }
  }

  private configureFlickerAPIKey(): void {
    window.Flickr.configure({
      apiKey: environment.flickerAPIKey,
      baseUrl: environment.flickerBaseUrl
    });
  }

  private fetchFlickerPhotos(): void {
    window.Flickr.fetchPhotos(
      {
        content_type: 1,
        safe_search: 1,
        orientation: 'landscape',
        tags: 'travel,nature,landscape',
        tag_mode: 'all',
        min_taken_date: '2024-01-01',
        max_taken_date: '2024-12-31',
        sort: 'interestingness-desc',
      },
      () => {
        const newPhotos: string[] = [];
        for (let i = 0; i < 3; i++) {
          const photo = getRandomPhoto('b');
          if (photo) {
            newPhotos.push(photo);
          }
        }
        this.photos = [...this.photos, ...newPhotos];
      }
    );
  }

  onSlideChange($event: any) {
    const activeIndex = $event.to;
    if (activeIndex > 3) {
      this.removePlaceholders();
    }
  }

  removePlaceholders() {
    this.photos = this.photos.slice(3);
  }

  private loadTravel(id: number) {
    this._travelService.getTravelById(id).subscribe({
      next: result => {
        this.travel = result;
        this._travelService.getTravelImages(this.travel.id).subscribe({
          next: data => {
            this.immaginiURLs = data.map(image => `data:image/jpeg;base64,${image}`);
          }
        });
      }, error: () => {
        this._router.navigate(['**']).then();
      }
    });
  }

  private loadSearchQuery() {
    this._activatedRoute.queryParams.subscribe(params => {
      const searchQuery = params['search'] || '';
      this.selectSuggestion(searchQuery);
    });
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

  private typeWriterEffect() {
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
          requestAnimationFrame(type);
        }
      };
      type();
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
          wrap: true,         // Consente il ciclo delle immagini
          touch: false,
          pause: false,
          keyboard: false,
          ride: "carousel",

        });
      }
    }
  }

  expandSearchBar(): void {
    this.isExpanded = true;
    this.isFocused = true;
  }

  collapseSearchBar(): void {
    if (this.filters && !this.filters.searchQuery) {
      this.isExpanded = false;
      this.isFocused = false;
      this.onSearch();
    }
  }

  onSearch(): void {
    if (this.filters) {
      this._router.navigate(['body1'], {queryParams: {search: this.filters.searchQuery}}).then();
    }
  }

  getAutocompleteSuggestions() {
    if (this.filters && this.filters.searchQuery.length > 2) {
      this._travelService.getSuggestions(this.filters).subscribe({
        next: result => {
          this.suggestions = result;
        }, error: () => {
          this.suggestions = [];
        }
      });
    } else {
      this.suggestions = [];
    }
  }

  selectSuggestion(suggestion: string) {
    if (this.filters) {
      this.filters.searchQuery = suggestion;
      this.suggestions = [];
      this.selectedIndex = -1;
    }
  }

  handleKeyDown($event: KeyboardEvent) {
    switch ($event.key) {
      case 'ArrowDown':
        if (this.suggestions.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
        $event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.suggestions.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
        $event.preventDefault();
        break;
      case 'Enter':
        if (this.selectedIndex >= 0) {
          this.selectSuggestion(this.suggestions[this.selectedIndex]);
          this.onSearch();
        }
        break;
      case 'Escape':
        this.selectSuggestion('');
        this.collapseSearchBar();
        const input = $event.target as HTMLInputElement;
        input.blur();
        break;
    }
  }
}
