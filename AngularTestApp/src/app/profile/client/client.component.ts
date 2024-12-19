import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgClass, NgForOf, NgStyle} from "@angular/common";
import {AddTravelComponent} from '../../add-travel/add-travel.component';
import {UpdateUserComponent} from '../../update-user/update-user.component';
import {ReviewComponent} from '../../review/review.component';
import {AddReviewComponent} from '../../add-review/add-review.component';
import {AuthenticationService} from '../../login/authentication.service';
import {User} from '../../models/user/user.model';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    NgForOf,
    AddTravelComponent,
    NgClass,
    NgStyle,
    UpdateUserComponent,
    ReviewComponent,
    AddReviewComponent
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  strokeDashArrayStart: string = '282, 285';
  strokeDashArrayEnd: string[] = ['100, 285', '200, 251', '100, 251', '90, 251', '251, 251'];
  user: User | null | undefined;
  birthdate: String | undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private authentication: AuthenticationService) {
  }

  ngOnInit() {
    this.animateStrokeDashArray();
    this.user = this.authentication.currentUserSubject.getValue();
    console.log(this.user);
    if (this.user?.birthDate) {
      const birthDateObj = new Date(this.user.birthDate);
      this.birthdate = birthDateObj.toLocaleDateString('it-IT');
    }
    console.log(this.birthdate);

  }

  animateStrokeDashArray() {
    const circles = document.querySelectorAll<SVGCircleElement>('.prova');
    circles.forEach((circle, index) => {
      const endValue = this.strokeDashArrayEnd[index];
      this.animateValue(circle, this.strokeDashArrayStart, endValue);
    });
  }

  animateValue(element: SVGCircleElement, from: string, to: string) {
    const [fromDash] = from.split(',').map(Number);
    const [toDash] = to.split(',').map(Number);
    let currentDash = fromDash;
    const step = (toDash - fromDash) / 60;
    const animation = () => {
      currentDash += step;
      if ((step > 0 && currentDash >= toDash) || (step < 0 && currentDash <= toDash)) {
        element.setAttribute('stroke-dasharray', to);
      } else {
        element.setAttribute('stroke-dasharray', `${currentDash}, 285`);
        requestAnimationFrame(animation);
      }
    };
    animation();
  }

  isPopupVisible = false;

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;

  }

  isPopupVisible2 = false;

  openPopup2() {
    this.isPopupVisible2 = true;
  }

  closePopup2() {
    this.isPopupVisible2 = false;

  }

  formatDate(date: Date | undefined): string {
    if (date) {
      return date.toLocaleDateString();
    }
    return '';
  }
}
