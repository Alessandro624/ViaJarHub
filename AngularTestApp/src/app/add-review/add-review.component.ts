import {Component, EventEmitter, Output} from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';

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
  dropdownOptions: string[] = ['Opzione 1', 'Opzione 2', 'Opzione 3'];
  selectedOption: string = '';
  rating: number = 0
  

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

    this.closeModal.emit();
  }

  protected readonly Math = Math;
}
