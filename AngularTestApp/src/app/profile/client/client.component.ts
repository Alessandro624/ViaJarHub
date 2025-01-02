import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {UpdateUserComponent} from '../../update-user/update-user.component';
import {ReviewComponent} from '../../review/review.component';
import {AddReviewComponent} from '../../add-review/add-review.component';
import {AuthenticationService} from '../../login/authentication.service';
import {ClientService} from './client.service';
import {User} from '../../models/user/user.model';
import {ReviewService} from '../../review/review.service';
import {Review} from '../../models/review/review.module';
import {ReviewmodalComponent} from '../../review/reviewmodal/reviewmodal.component';
import {WishlistComponent} from '../../wishlist/wishlist.component';
import {PaymentService} from '../../payment/payment.service';
import {TravelType} from '../../models/travel/travel-type.enum';

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
    NgIf,
    ReviewmodalComponent,
    WishlistComponent
  ],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit {
  strokeDashArrayStart: string = '282, 285';
  strokeDashArrayEnd: string[] = [];
  user!: User;
  birthdate: String | undefined;
  profileImageUrl: string = '';
  profileImageBlob!: Blob | null;
  isPopupVisible2 = false;
  isPopupVisible = false;
  // isPopupVisible3 = false;
  isPopupVisible4 = false;
  // settedTravel: Travel | undefined = undefined;
  reviews: Review[] = [];
  recensioniVisibili: Review[] = [];
  loadBtnless = false;
  loadBtnmore = false;
  startIndex: number = 0;
  step: number = 3;
  numrec: number = 0;
  selectReview: Review | null = null;
  numbook = 0;
  culturaList = 0;
  relaxList = 0;
  naturaList = 0;
  romanticoList = 0;
  famigliaList = 0;
  tipoViaggio: string = '';

  constructor(private _authenticationService: AuthenticationService, private _clientService: ClientService, private reviewService: ReviewService, private paymentService: PaymentService) {
  }

  ngOnInit() {
    this.setUser();
    this.showBirthdate();
    this.showProfileImage();
    this.reviewService.getReviewsByUser(this.user.email).subscribe({
        next: data => {
          this.reviews = data.reverse();
          this.aggiornaRecensioniVisibili();
          this.numrec = this.reviews.length;
        }
      }
    )
    /*this.reviewService.countReviewsByUser(this.user.email).subscribe({
      next: data => {
        this.numrec = data;
      }
    })*/
    this.paymentService.booking$.subscribe({
      next: data => {
        if (data) {
          this.numbook = data?.length;
          for (let travel of data) {
            console.log(travel.travelType);
          }
          this.culturaList = data.filter(item => String(item.travelType) === "CULTURA").length;
          this.relaxList = data.filter(item => String(item.travelType) === "RELAX").length;
          this.naturaList = data.filter(item => String(item.travelType) === "NATURA").length;
          this.romanticoList = data.filter(item => String(item.travelType) === "ROMANTICO").length;
          this.famigliaList = data.filter(item => String(item.travelType) === "FAMIGLIA").length;
          console.log("cultura" + this.culturaList);
          console.log(this.relaxList);
          console.log(this.naturaList);
          console.log(this.romanticoList);
          console.log(this.famigliaList);
          this.updateStrokeDashArray();
          this.animateStrokeDashArray();
          this.tipoViaggio = this.getHighestType();
        }
      }
    })
  }

  aggiornaRecensioniVisibili() {
    this.recensioniVisibili = this.reviews.slice(this.startIndex, this.startIndex + this.step);
    this.loadBtnless = this.startIndex != 0;
    console.log(this.startIndex);
    console.log(this.reviews.length);
    this.loadBtnmore = this.startIndex + this.step < this.reviews.length;
    console.log(this.loadBtnless);
    console.log(this.loadBtnmore);
  }

  animateStrokeDashArray() {
    const circles = document.querySelectorAll<SVGCircleElement>('.grafo');
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
    console.log("prova");
    this.isPopupVisible2 = false;
  }

  /*openPopup3(travel:Travel) {
    this.isPopupVisible3 = true;
    this.settedTravel = travel;
  }

  closePopup3() {
    this.isPopupVisible3 = false;
    this.settedTravel = undefined;
  }*/


  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        if (data) {
          this.user = data;
        }
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

  protected showProfileImage() {
    this._clientService.getUserProfileImage().subscribe(
      {
        next: data => {
          this.profileImageUrl = URL.createObjectURL(data);
          this.profileImageBlob = data;
          console.log(this.profileImageUrl);
        },
        error: error => {
          console.log(error);
          this.profileImageUrl = '';
          this.profileImageBlob = null;
        }
      }
    )
  }

  lessReview() {
    if (this.startIndex - this.step >= 0) {
      this.startIndex -= this.step;
      this.aggiornaRecensioniVisibili();
    }
  }

  moreReview() {
    if (this.startIndex + this.step < this.reviews.length) {
      this.startIndex += this.step;
      this.aggiornaRecensioniVisibili();
    }
  }

  aggiornaLista(review: Review) {
    console.log("mannananan")
    this.reviews.unshift(review);
    this.startIndex = 0;
    this.numrec += 1;
    this.aggiornaRecensioniVisibili();
  }

  rimuoviDaLista(review: Review) {
    console.log("mannananan")
    console.log(review.travel.id)
    console.log(this.reviews)
    const index = this.reviews.findIndex(rev => rev.travel.id === review.travel.id);
    if (index !== -1) {
      this.reviews.splice(index, 1);
    }
    console.log(this.reviews)
    this.startIndex = 0;
    this.numrec += 1;
    this.aggiornaRecensioniVisibili();
  }


  openPopup4(review: Review) {
    this.isPopupVisible4 = true;
    this.selectReview = review;
  }

  closePopup4() {
    this.isPopupVisible4 = false;
  }

  modificaLista(review: Review) {
    this.rimuoviDaLista(review);
    this.aggiornaLista(review);
  }

  updateStrokeDashArray(): void {
    const calculatePercentage = (count: number): number => (count / this.numbook) * 100;

    const calculateStrokeDashArray = (percentage: number): string => {
      const visible = (100 - percentage) * 2.85; // 285 * (100 - percentage) / 100
      return `${visible.toFixed(0)}, 285`;
    };

    this.strokeDashArrayEnd = [
      calculateStrokeDashArray(calculatePercentage(this.culturaList)),
      calculateStrokeDashArray(calculatePercentage(this.relaxList)),
      calculateStrokeDashArray(calculatePercentage(this.naturaList)),
      calculateStrokeDashArray(calculatePercentage(this.romanticoList)),
      calculateStrokeDashArray(calculatePercentage(this.famigliaList)),
    ];
  }

  getHighestType(): string {
    // Definisci le chiavi del tipo
    type TravelTypeKeys = keyof typeof travelTypes;

    // Oggetto con i valori
    const travelTypes = {
      Cultura: this.culturaList,
      Relax: this.relaxList,
      Natura: this.naturaList,
      Romantico: this.romanticoList,
      Famiglia: this.famigliaList,
    };

    // Trova il tipo con il valore massimo
    const highestType = (Object.keys(travelTypes) as TravelTypeKeys[]).reduce((prev, current) => {
      return travelTypes[prev] > travelTypes[current] ? prev : current;
    });

    return highestType;
  }


}
