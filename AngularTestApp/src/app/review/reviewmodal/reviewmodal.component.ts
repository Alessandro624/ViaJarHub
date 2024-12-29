import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Review} from '../../models/review/review.module';
import {TravelService} from '../../travel-detail/travel.service';
import {ReviewService} from '../review.service';
import {CarouselComponent} from '../../carousel/carousel.component';

@Component({
  selector: 'app-reviewmodal',
  standalone: true,
  imports: [
    CarouselComponent
  ],
  templateUrl: './reviewmodal.component.html',
  styleUrl: './reviewmodal.component.css'
})
export class ReviewmodalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Input() review: Review | null = null;


  constructor(private _travelService: TravelService, private reviewService: ReviewService) {

  }

  ngOnInit(): void {

  }
}
