import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {UpdateUserComponent} from '../../update-user/update-user.component';
import {ReviewComponent} from '../../review/review.component';
import {AddReviewComponent} from '../../add-review/add-review.component';
import {AuthenticationService} from '../../login/authentication.service';
import {ClientService} from './client.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    NgForOf,
    NgClass,
    NgStyle,
    UpdateUserComponent,
    ReviewComponent,
    AddReviewComponent,
    NgIf
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  strokeDashArrayStart: string = '282, 285';
  strokeDashArrayEnd: string[] = ['100, 285', '200, 251', '100, 251', '90, 251', '251, 251'];
  user!: any;
  birthdate: String | undefined;
  isPopupVisible2 = false;
  profileImageUrl: string = '';

  constructor(private _authenticationService: AuthenticationService, private _clientService: ClientService) {
  }

  ngOnInit() {
    this.setUser();
    this.showBirthdate();
    this.showProfileImage();
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


  openPopup2() {
    this.isPopupVisible2 = true;
  }

  closePopup2() {
    this.isPopupVisible2 = false;

  }

  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        this.user = data;
        console.log(this.user);
      }, error: error => console.log(error)
    });
  }

  private showBirthdate() {
    if (this.user.birthDate) {
      const birthDateObj = new Date(this.user.birthDate);
      this.birthdate = birthDateObj.toLocaleDateString('it-IT');
    }
    console.log(this.birthdate);
  }

  private showProfileImage() {
    this._clientService.getUserProfileImage().subscribe(
      {
        next: data => {
          this.profileImageUrl = URL.createObjectURL(data);
        },
        error: error => {
          console.log(error);
        }
      }
    )
  }
}
