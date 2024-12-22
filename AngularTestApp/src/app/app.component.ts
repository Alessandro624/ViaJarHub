import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {UserRole} from './models/user/user-role.enum';
import {AuthenticationService} from './login/authentication.service';
import {User} from './models/user/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  user!: User | null;
  protected readonly UserRole = UserRole;
  isDropdownOpened: boolean = false;
  currentFrom: 'login' | 'registerStep1' | 'registerStep2' | 'forgotPasswordEmail' = 'login';

  constructor(private _authenticationService: AuthenticationService, private _router: Router, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.setUser();
    this.setCurrentForm();
  }

  onLogout() {
    this._authenticationService.onLogout().subscribe(
      () => {
        this._router.navigate([''], {
          queryParams: {
            isOpened: false,
            currentForm: 'login'
          }
        }).then(() => alert("Logout completato"));
      }
    );
  }

  toggleDropdown() {
    this.isDropdownOpened = !this.isDropdownOpened;
  }

  private setUser() {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        this.user = data;
      }, error: error => console.log(error)
    });
  }

  protected setCurrentForm() {
    this._activatedRoute.queryParams.subscribe(params => {
      if (params['isOpened']) {
        this.isDropdownOpened = params['isOpened'] === 'true';
      }
      if (params['currentForm'] && params['currentForm'] !== 'registerStep2') {
        this.currentFrom = params['currentForm'];
      }
    });
  }
}
