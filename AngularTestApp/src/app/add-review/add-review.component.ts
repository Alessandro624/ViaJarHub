import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ReviewService} from '../review/review.service';
import {Review} from '../models/review/review.module';
import {AuthenticationService} from '../login/authentication.service';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css'
})
export class AddReviewComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  dropdownOptions: string[] = ['26', '27', '28', '29', '30'];
  selectedOption: string = '';
  rating: number = 0
  images: File[] = [];
  imagesUrl: string[] = [];
  imageError: string = '';


  constructor(private reviewService: ReviewService, private authentication: AuthenticationService) {
  }

  comment: string = '';
  @Output() closeModal = new EventEmitter<unknown>();//invia evento al padre
  @Output() reviewAdded = new EventEmitter<Review>();

  rate(star: number) {
    this.rating = star;
    console.log(this.rating);
  }

  selectType(option: string) {
    this.selectedOption = option;
  }

  submitForm() {
    console.log('Opzione selezionata:', this.selectedOption);
    console.log('Stelle selezionate:', this.rating);
    console.log('Commento:', this.comment);

    this.authentication.currentUser$.subscribe(user => {
      if (user) {
        let review: Review = {
          idTravel: Number(this.selectedOption),
          emailUser: user.email,
          stars: this.rating,
          comment: this.comment,
          data: this.formatDate(new Date())
        }
        this.reviewService.createReview(review, this.images).subscribe(
          {
            next: () => {
              this.reviewAdded.emit(review);
            }
          }
        );
      }
      this.rating = 0
      this.images = [];
      this.imagesUrl = [];
      this.comment = '';
      this.closeModal.emit();
    })
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
    this.fileInput.nativeElement.click(); // Attiva l'input file nascosto
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
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mesi da 0 a 11
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
}
