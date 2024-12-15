import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgClass, NgForOf, NgStyle} from "@angular/common";
import {AddTravelComponent} from '../../add-travel/add-travel.component';
import {UpdateUserComponent} from '../../update-user/update-user.component';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    NgForOf,
    AddTravelComponent,
    NgClass,
    NgStyle,
    UpdateUserComponent
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  strokeDashArrayStart: string = '282, 285';
  strokeDashArrayEnd: string[] = ['100, 285', '200, 251', '100, 251', '90, 251', '251, 251'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngOnInit() {
    this.animateStrokeDashArray();
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

}
