import {Component, ElementRef, OnInit} from '@angular/core';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css'
})
export class ReviewComponent implements OnInit {
  inAdmin: boolean = false;
  inClient: boolean = false;
  inDetails: boolean = false;

  constructor(private elementRef: ElementRef) {
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
  }

}
