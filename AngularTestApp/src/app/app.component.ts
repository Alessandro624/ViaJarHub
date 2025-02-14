import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {UserRole} from './models/user/user-role.enum';
import {AuthenticationService} from './login/authentication.service';
import {User} from './models/user/user.model';
import {environment} from '../environments/environment';
import {ContactModalComponent} from './contact-modal/contact-modal.component';
import {AlertComponent} from './alert/alert.component';
import {ChatbotComponent} from './chatbot/chatbot.component';
import {AlertService} from './alert/alert.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent, ContactModalComponent, AlertComponent, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppComponent implements OnInit {
  protected readonly UserRole = UserRole;
  protected readonly environment = environment;
  user!: User | null;
  currentFrom: 'login' | 'registerStep1' | 'registerStep2' | 'forgotPasswordEmail' = 'login';
  isDropdownOpened: boolean = false;
  isPopupVisible: boolean = false;
  currentYear = new Date().getFullYear();

  constructor(private _authenticationService: AuthenticationService, private _activatedRoute: ActivatedRoute, private _router: Router, private _alertService: AlertService) {
  }

  ngOnInit() {
    this.setUser();
    this.setCurrentForm();
  }

  onLogout() {
    this._authenticationService.onLogout().subscribe(
      () => {
        this.isDropdownOpened = false;
        this.currentFrom = 'login';
        this._router.navigate(['']).then();
        this._alertService.showAlert("Logout completato", true);
      });
  }

  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        this.user = data;
      }
    });
  }

  private setCurrentForm() {
    this._activatedRoute.queryParams.subscribe(params => {
      if (params['isOpened']) {
        this.isDropdownOpened = params['isOpened'] === 'true';
      } else {
        this.isDropdownOpened = false;
      }
      if (params['currentForm'] && params['currentForm'] !== 'registerStep2') {
        this.currentFrom = params['currentForm'];
      } else {
        this.currentFrom = 'login';
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpened = !this.isDropdownOpened;
  }

  openPopup() {
    this.isPopupVisible = true;
  }

  closePopup() {
    this.isPopupVisible = false;
  }
}
