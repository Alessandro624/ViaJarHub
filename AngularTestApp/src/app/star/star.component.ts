import {
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-star',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './star.component.html',
  styleUrl: './star.component.css'
})
export class StarComponent implements OnChanges {
  @Input() rating: number = 0;
  @Input() beat: boolean = false;
  fullStars: number[] = [];
  emptyStars: number[] = [];
  hasHalfStar: boolean = false;
  inDetails = false;

  constructor(private elementRef: ElementRef, @Inject(NgZone) private ngZone: NgZone) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.ngZone.runOutsideAngular(() => {
        this.inDetails = this.isContainedIn('app-infotravel');
        this.calculateStars();
      });
    }
  }

  calculateStars(): void {
    const full = Math.floor(this.rating);
    const hasHalf = this.rating % 1 !== 0;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    this.fullStars = Array(full).fill(0);
    this.hasHalfStar = hasHalf;
    this.emptyStars = Array(empty).fill(0);
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
}
