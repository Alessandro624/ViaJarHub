import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {Review} from '../../models/review/review.module';
import {TravelService} from '../../travel-detail/travel.service';
import {ReviewService} from '../review.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Travel} from '../../models/travel/travel.model';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthenticationService} from '../../login/authentication.service';
import {StarComponent} from '../../star/star.component';

@Component({
  selector: 'app-reviewmodal',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    FormsModule,
    StarComponent
  ],
  templateUrl: './reviewmodal.component.html',
  styleUrls: ['./reviewmodal.component.css']
})
export class ReviewmodalComponent implements OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() closeModal = new EventEmitter<void>();
  @Output() reviewRemoved = new EventEmitter<Review>();
  @Output() reviewModified = new EventEmitter<Review>();

  @Input() review: Review | null = null;
  @Input() isOpen: boolean = false;

  immaginiURLs: string[] = [];
  travel: Travel | null = null;
  inClient: boolean = false;
  viewMode: boolean = true;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  rating: number = 0;
  images: File[] = [];
  imagesUrl: string[] = [];
  imageError: string = '';
  comment = '';
  star = 0;
  destinazione = '';

  constructor(private _travelService: TravelService, private reviewService: ReviewService, private elementRef: ElementRef, private authentication: AuthenticationService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.initialize(); // Inizializza il componente quando il modale è aperto
    }
  }

  initialize(): void {
    if (this.review) {
      this.errorMessage = '';
      this.star = this.review.stars;
      this.isLoading = true;
      this.reviewService.getReviewImages(this.review.travel.id, this.review.user.email).subscribe({
        next: result => {
          this.immaginiURLs = result.map(image => `data:image/jpeg;base64,${image}`);
          if (this.review) {
            this.star = this.review.stars;
            this._travelService.getName(this.review.travel.id).subscribe({
              next: data => {
                this.destinazione = data[0];
                this.isLoading = false;
                if (this.immaginiURLs.length === 0) {
                  this.errorMessage = 'Nessuna immagine trovata.';
                }
              }
            });
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Errore durante il caricamento delle immagini.';
        }
      });

    }

    this.inClient = this.isContainedIn('app-client');
  }

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

  changeToUpdate() {
    this.viewMode = false;
  }

  rate(star: number) {
    this.rating = star;
  }

  submitForm() {
    this.authentication.currentUser$.subscribe(user => {
      if (user) {
        let reviewTemp = this.review;
        if (reviewTemp) {
          reviewTemp.comment = this.comment;
          reviewTemp.stars = this.rating;
          reviewTemp.data = this.formatDate(new Date());
        }

        this.delete();

        if (reviewTemp) {
          this.reviewService.createReview(reviewTemp, this.images).subscribe({
            next: () => {
              this.viewMode = true;
              this.reviewModified.emit(reviewTemp);
              this.closeModal.emit();
            }
          });
        }
      }
      this.rating = 0;
      this.images = [];
      this.imagesUrl = [];
      this.comment = '';
      this.closeModal.emit();
    });
  }

  onFileSelect(event: any) {
    this.checkAndAddFiles(event.target.files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.checkAndAddFiles(event.dataTransfer?.files);
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  private checkAndAddFiles(files: FileList | undefined) {
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
          this.imageError = 'Sono consentite solo immagini';
          return;
        }
      }
      this.addFiles(files);
    }
  }

  private addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.images.push(files[i]);
      this.imagesUrl.push(URL.createObjectURL(files[i]));
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imagesUrl.splice(index, 1);
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  delete() {
    if (this.review) {
      this.reviewService.deleteReview(this.review).subscribe({
        next: () => {
          if (this.review) {
            this.closeModal.emit();
            this.reviewRemoved.emit(this.review);
          }
        }
      });
    }
  }
}
