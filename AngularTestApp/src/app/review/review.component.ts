import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {ReviewService} from './review.service';
import {NgForOf} from '@angular/common';
import {Travel} from '../models/travel/travel.model';
import {User} from '../models/user/user.model';
import {Review} from '../models/review/review.module';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  inAdmin: boolean = false;
  inClient: boolean = false;
  inDetails: boolean = false;
  immaginiURLs: string[] = [];
  @Input() review: Review = {
    idTravel: 0,
    emailUser: '',
    stars: 0,
    comment: '',
    data: ''

  };


  constructor(private elementRef: ElementRef, private reviewService: ReviewService) {
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

  ngOnInit(): void {
    this.inAdmin = this.isContainedIn('app-admin');
    this.inClient = this.isContainedIn('app-client');
    this.inDetails = this.isContainedIn('app-infotravel');

    if (this.review) {
      this.reviewService.getReview(this.review.idTravel, this.review.emailUser).subscribe(
        {
          next: result => {
            console.log(result);
            if (this.review) {
              this.reviewService.getReviewImages(this.review.idTravel, this.review.emailUser).subscribe({
                next: data => {
                  this.immaginiURLs = data.map(image => `data:image/jpeg;base64,${image}`);
                }
              })
            }

          }
        }
      )
    }


  }

}
