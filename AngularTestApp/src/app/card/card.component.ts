import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Travel} from '../models/travel/travel.model';
import {RouterLink} from '@angular/router';
import {TravelService} from '../travel-detail/travel.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UpdateTravelComponent} from '../update-travel/update-travel.component';
import {NgForOf, NgIf} from '@angular/common';
import {DeleteTravelComponent} from '../delete-travel/delete-travel.component';
import {UserRole} from '../models/user/user-role.enum';
import {AuthenticationService} from '../login/authentication.service';
import {StarComponent} from '../star/star.component';
import {combineLatestAll} from 'rxjs';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    UpdateTravelComponent,
    NgIf,
    DeleteTravelComponent,
    NgForOf,
    StarComponent
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent implements OnInit {
  @Input() travel!: Travel;
  @Output() localDeleteTravel = new EventEmitter<void>();
  isAdmin = false;
  copertina: string | null = null;
  showUpdateTravel: boolean = false;
  showDeleteTravel: boolean = false;
  stars: number = 0;


  constructor(private _travelService: TravelService, private _authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.loadImage();
    this.loadStars();
    this.checkAdmin();
  }

  private loadImage() {
    this._travelService.getTravelImages(this.travel.id).subscribe(
      {
        next: data => {
          this.copertina = `data:image/jpeg;base64,${data[0]}`;
        },
        error: error => {
          console.log(error);
        }
      }
    );
  }

  private loadStars() {
    this._travelService.getStars(this.travel.id).subscribe({
      next: data => {
        this.stars = data;
      }, error: error => {
        this.stars = 0;
      }
    });
  }

  private checkAdmin() {
    this._authenticationService.currentUser$.subscribe((user) => {
      this.isAdmin = !!(user && user.authorities[0].authority === UserRole.ADMIN);
    });
  }

  handleMouse($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  closeUpdateTravel() {
    this.showUpdateTravel = false;
  }

  closeDeleteTravel() {
    this.showDeleteTravel = false;
  }


}
