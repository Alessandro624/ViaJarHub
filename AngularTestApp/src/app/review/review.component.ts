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
  starsHTML: string = '';


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

              this.travelService.getTravelById(this.review.travel.id).subscribe(
                {
                  next: result => {
                    console.log(result.destination);
                    this.travelName = result.destination;

                  }
                }
              )
            }

          }
        }
      )
    }
    this.starsHTML = this.generateStarsHTML(this.roundToHalf(this.review.stars));

  }

  generateStarsHTML(rating: number): string {
    let fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fa fa-star" style="color: yellow;"></i>';
    }
    if (halfStar) {
      starsHTML += '<i class="fa fa-star-half-o" style="color: yellow;"></i>';
      fullStars++;
    }
    for (let i = fullStars; i < 5; i++) {
      starsHTML += '<i class="fa fa-star-o"></i>';
    }
    return starsHTML;
  }

  private roundToHalf(value: number): number {
    return Math.round(value * 2) / 2;
  }
}
