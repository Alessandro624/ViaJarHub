import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetToken: string = '';
  password: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = true;
  isError: boolean = false;
  showResetPasswordForm: boolean = false;
  alertMessage: string = '';

  constructor(private _authenticationService: AuthenticationService, private _router: Router, private _activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    const token = this._activatedRoute.snapshot.paramMap.get('token');
    if (token) {
      this._authenticationService.validatePasswordResetToken(token).subscribe({
          next: () => {
            this.showResetPasswordForm = true;
            this.resetToken = token;
            this.isLoading = false;
          }, error: () => {
            this.isError = true;
            this.isLoading = false;
          }
        }
      )
    } else {
      this.isError = true;
    }
  }

  onClose() {
    // se non ci sono errori apri login, se ci sono errori imposta a forgotPasswordEmail ma non aprire
    this._router.navigate([''], {
      queryParams: {
        isOpened: !this.isError,
        currentForm: this.isError ? 'forgotPasswordEmail' : 'login'
      }
    }).then();
  }

  validatePassword(password: string) {
    const hasNumber = /\d/;
    const hasLower = /[a-z]/;
    const hasUpper = /[A-Z]/;
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      password.length >= 8 &&
      hasNumber.test(password) &&
      hasLower.test(password) &&
      hasUpper.test(password) &&
      hasSpecial.test(password)
    );
  };

  onResetPassword() {
    if (!this.resetToken) {
      this.isError = true;
    } else {
      this.checkPassword();
      this.checkConfirmPassword();
      if (!this.passwordError && !this.confirmPasswordError) {
        this.isLoading = true;
        this._authenticationService.onResetPassword(this.resetToken, this.password).subscribe(() => {
          this.isLoading = false;
          console.log('Password reset successful:', {token: this.resetToken, password: this.password});
          alert('Password modificata correttamente:');
          this.onClose();
        }, (error) => {
          this.isLoading = false;
          console.error(error);
          this.alertMessage = "Errore nella modifica della password";
        });
      }
    }
  }

  private checkPassword() {
    if (!this.password) {
      this.passwordError = 'Password obbligatoria';
    } else if (!this.validatePassword(this.password)) {
      this.passwordError = 'La password deve contenere almeno 8 caratteri, un numero, una maiuscola e un carattere speciale.';
    }
  }

  private checkConfirmPassword() {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Conferma password obbligatoria';
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'La password e la conferma della password non coincidono.';
    } else if (!this.validatePassword(this.confirmPassword)) {
      this.confirmPasswordError = 'La password deve contenere almeno 8 caratteri, un numero, una maiuscola e un carattere speciale.';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
