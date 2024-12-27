import {Component, EventEmitter, Output} from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';
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
    NgClass
  ],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css'
})
export class AddReviewComponent {
  dropdownOptions: string[] = ['26', 'Opzione 2', 'Opzione 3'];
  selectedOption: string = '';
  rating: number = 0

  constructor(private reviewService: ReviewService, private authentication: AuthenticationService) {
  }

  comment: string = '';
  @Output() closeModal = new EventEmitter<unknown>();//invia evento al padre

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
      let review: Review = {
        idTravel: Number(this.selectedOption),
        emailUser: user?.email,
        stars: this.rating,
        comment: this.comment,
      }
      this.reviewService.createReview(review).subscribe();
      this.closeModal.emit();
    })
  }
}
