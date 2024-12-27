import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Travel} from '../models/travel/travel.model';
import {RouterLink} from '@angular/router';
import {TravelService} from '../travel-detail/travel.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UpdateTravelComponent} from '../update-travel/update-travel.component';
import {NgIf} from '@angular/common';
import {DeleteTravelComponent} from '../delete-travel/delete-travel.component';
import {UserRole} from '../models/user/user-role.enum';
import {AuthenticationService} from '../login/authentication.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    UpdateTravelComponent,
    NgIf,
    DeleteTravelComponent
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

  constructor(private _travelService: TravelService, private _authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.loadImage();
    this._authenticationService.currentUser$.subscribe((user) => {
      this.isAdmin = !!(user && user.authorities[0].authority === UserRole.ADMIN);
    })
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
