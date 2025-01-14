import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService} from '../authentication.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  message: string = '';
  isLoading: boolean = true;
  isError: boolean = false;

  constructor(private _authenticationService: AuthenticationService, private _router: Router, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const token = this._activatedRoute.snapshot.paramMap.get('token');
    if (token) {
      this._authenticationService.sendVerificationToken(token).subscribe({
        next: () => {
          this.message = 'Email confermata con successo!';
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.isError = true;
        }
      });
    } else {
      this.isLoading = false;
      this.isError = true;
    }
  }

  onClose() {
    // se non ci sono errori apri login, se ci sono errori imposta a register ma non aprire
    this._router.navigate([''], {
      queryParams: {
        isOpened: !this.isError,
        currentForm: this.isError ? 'registerStep1' : 'login'
      }
    }).then();
  }
}
