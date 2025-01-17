import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  PLATFORM_ID
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthenticationService} from './authentication.service';
import {isPlatformBrowser, NgClass, NgIf} from '@angular/common';
import {environment} from '../../environments/environment';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  birthDate: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstNameError: string = '';
  lastNameError: string = '';
  birthDateError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  @Input() currentForm!: 'login' | 'registerStep1' | 'registerStep2' | 'forgotPasswordEmail';
  @Input() isOpened: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  maxDate: string = new Date().toISOString().split('T')[0];
  alertMessage: string = '';
  isLoading: boolean = false;
  @Output() setCurrentForm = new EventEmitter<void>();

  constructor(@Inject(NgZone) private ngZone: NgZone, @Inject(PLATFORM_ID) private platformId: Object, private _authenticationService: AuthenticationService, private _alertService: AlertService) {
  }

  ngOnInit(): void {
    this.setCurrentForm.emit();
    this.loadGoogleButton();
    this.changeForm(this.currentForm);
  }

  validateEmail(email: string) {
    return /^[A-z0-9.+_-]+@[A-z0-9._-]+\.[A-z]{2,6}$/.test(email);
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

  validateName(name: string) {
    return /^[a-zA-Zà-üÀ-Ü\s]*$/.test(name);
  }

  validateBirthDate(birthDate: string) {
    return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(birthDate);
  }

  onLogin() {
    this.resetErrorLabels();
    this.checkEmail();
    this.checkPassword();
    if (!this.emailError && !this.passwordError) {
      this.isLoading = true;
      this._authenticationService.onLogin(this.email, this.password).subscribe({
        next: () => {
          this.isLoading = false;
          this._alertService.showAlert("Login effettuato con successo", true);
        }, error: error => {
          this.isLoading = false;
          this.alertMessage = error.message;
        }
      });
    }
  }

  onRegisterStep1() {
    this.resetErrorLabels();
    this.checkFirstName();
    this.checkLastName();
    this.checkBirthDate();
    if (!this.firstNameError && !this.lastNameError && !this.birthDateError) {
      this.changeForm('registerStep2');
    }
  }

  onRegisterStep2() {
    this.resetErrorLabels();
    this.checkEmail();
    this.checkPassword();
    this.checkConfirmPassword();
    if (!this.emailError && !this.passwordError && !this.confirmPasswordError) {
      this.isLoading = true;
      this._authenticationService.onRegister(this.email, this.password, this.firstName, this.lastName, new Date(this.birthDate)).subscribe({
        next: () => {
          this.isLoading = false;
          this._alertService.showAlert("Email di conferma inviata con successo", true);
          this.sendUserHome();
        }, error: error => {
          this.isLoading = false;
          this.alertMessage = error.message;
        }
      });
    }
  }

  onForgotPasswordEmail() {
    this.resetErrorLabels();
    this.checkEmail();
    if (!this.emailError) {
      this.isLoading = true;
      this._authenticationService.onForgotPassword(this.email).subscribe({
          next: () => {
            this.isLoading = false;
            this._alertService.showAlert('Email di reset password inviata correttamente', true);
            this.sendUserHome();
          }, error: error => {
            this.isLoading = false;
            this.alertMessage = error.message;
          }
        }
      );
    }
  }

  changeForm(nextForm: typeof this.currentForm) {
    this.resetFields();
    this.resetErrorLabels();
    this.currentForm = nextForm;
    if (this.currentForm === 'login') {
      this.loadGoogleButton();
    }
  }

  resetFields() {
    // tranne le password, gli altri campi posso essere usati come 'auto-completamento'
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  private resetErrorLabels() {
    this.firstNameError = '';
    this.lastNameError = '';
    this.birthDateError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.alertMessage = '';
  }

  private checkEmail() {
    if (!this.email) {
      this.emailError = 'Email obbligatoria';
    } else if (!this.validateEmail(this.email)) {
      this.emailError = 'Formato email non valido.';
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

  private checkFirstName() {
    if (!this.firstName) {
      this.firstNameError = 'Nome obbligatorio';
    } else if (!this.validateName(this.firstName)) {
      this.firstNameError = 'Il nome deve contenere solo lettere';
    }
  }

  private checkLastName() {
    if (!this.lastName) {
      this.lastNameError = 'Cognome obbligatorio';
    } else if (!this.validateName(this.lastName)) {
      this.lastNameError = 'Il cognome deve contenere solo lettere';
    }
  }

  private checkBirthDate() {
    if (!this.birthDate) {
      this.birthDateError = 'Data di nascita obbligatoria';
    } else if (!this.validateBirthDate(this.birthDate)) {
      this.birthDateError = 'Formato data di nascita non valido.';
    } else {
      const today = new Date();
      const birthDate = new Date(this.birthDate);
      if (birthDate > today) {
        this.birthDateError = 'La data di nascita non può essere nel futuro.';
      }
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  preventClose($event: MouseEvent) {
    $event.preventDefault();
  }

  loadGoogleButton() {
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleButton();
      this.waitForButtonAndRender();
    }
  }

  private waitForButtonAndRender() {
    const interval = this.ngZone.runOutsideAngular(() =>
      setInterval(() => {
        const buttonElement = document.getElementById("google-signin-button");
        if (buttonElement) {
          clearInterval(interval);
          this.renderGoogleButton();
        }
      }, 100));
  }

  private initGoogleButton() {
    (globalThis as any).google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleGoogleLogin.bind(this),
      ux_mode: "popup",
      auto_prompt: "false"
    });
  }

  private renderGoogleButton() {
    (globalThis as any).google.accounts.id.renderButton(
      document.getElementById("google-signin-button"),
      {
        type: 'standard',
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        locale: "it",
        logo_alignment: "left"
      }
    );
  }

  handleGoogleLogin(response: any) {
    this.sendTokenToBackend(response.credential);
  }

  /* decodeJwtResponse(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } */

  sendTokenToBackend(token: string) {
    this.isLoading = true;
    this._authenticationService.onGoogleLogin(token).subscribe({
        next: () => {
          this.isLoading = false;
          this._alertService.showAlert("Accesso con google effettuato correttamente", true)
          this.sendUserHome();
        },
        error: error => {
          this.isLoading = false;
          this.alertMessage = error.message;
        }
      }
    );
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-menu')) {
      this.isOpened = false;
    }
  }

  private sendUserHome() {
    this.reloadPage();
    /* this._router.navigate([''], {
      queryParams: {
        isOpened: false,
        currentForm: 'login'
      }
    }).then(this.reloadPage.bind(this)); */
  }

  reloadPage() {
    // window.location.reload();
    this.isOpened = false;
    this.changeForm('login');
  }
}
