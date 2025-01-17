import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Review} from '../models/review/review.model';
import {StarComponent} from '../star/star.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    StarComponent,
    NgIf
  ],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  inAdmin: boolean = false;
  inClient: boolean = false;
  inDetails: boolean = false;
  @Input() review!: Review;

  constructor(private elementRef: ElementRef) {
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

  ngOnInit(): void {
    this.inAdmin = this.isContainedIn('app-admin');
    this.inClient = this.isContainedIn('app-client');
    this.inDetails = this.isContainedIn('app-infotravel');
  }
}
