import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {UserRole} from './models/user/user-role.enum';
import {AuthenticationService} from './login/authentication.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  // TODO messaggio/alert di logout avvenuto o meno
  user!: any;

  constructor(private _authenticationService: AuthenticationService, private _router: Router) {
    this._authenticationService.currentUser$.subscribe({
      next: data => {
        this.user = data;
      }, error: error => console.log(error)
    });
  }

  onLogout() {
    this._authenticationService.onLogout().subscribe(
      () => {
        this._router.navigate(['/']).then();
      }
    );
  }

  protected readonly UserRole = UserRole;
}
