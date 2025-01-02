import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {ReviewService} from './review.service';
import {Review} from '../models/review/review.module';
import {TravelService} from '../travel-detail/travel.service';
import {StarComponent} from '../star/star.component';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    StarComponent
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  inAdmin: boolean = false;
  inClient: boolean = false;
  inDetails: boolean = false;
  travelName: string = '';
  // immaginiURLs: string[] = [];

  @Input() review!: Review;


  constructor(private elementRef: ElementRef, private reviewService: ReviewService, private travelService: TravelService) {
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
      this.reviewService.getReview(this.review.travel.id, this.review.user.email).subscribe(
        {
          next: result => {
            console.log(result);
            if (this.review) {

              this.travelService.getName(this.review.travel.id).subscribe(
                {
                  next: result => {
                    this.travelName = result[0];

                  }
                }
              )
            }

          }
        }
      )
    }

  }


}
