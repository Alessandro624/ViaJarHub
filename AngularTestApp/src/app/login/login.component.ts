import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService} from './authentication.service';
import {isPlatformBrowser} from '@angular/common';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent implements OnInit {
  // TODO aggiungere logica registrazione e attivazione degli alert/messaggi di insuccesso/successo delle operazioni

  firstName: string = '';
  lastName: string = '';
  telephone: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstNameError: string = '';
  lastNameError: string = '';
  telephoneError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  currentForm: 'login' | 'registerStep1' | 'registerStep2' | 'forgotPasswordEmail' | 'resetPassword' = 'login';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _authenticationService: AuthenticationService, private _router: Router) {
  }

  ngOnInit(): void {
    this.changeForm('login');
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleButton();
      this.renderGoogleButton();
    }
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
    return /[a-zA-Z]+$/.test(name);
  }

  validatePhone(phone: string) {
    return /^((00|\+)39[. ]??)??3\d{2}[. ]??\d{6,7}$/.test(phone);
  }

  onLogin() {
    this.resetErrorLabels();
    this.checkEmail();
    this.checkPassword();
    if (!this.emailError && !this.passwordError) {
      this._authenticationService.onLogin(this.email, this.password).subscribe(
        () => {
          console.log('Login successful:', {email: this.email, password: this.password});
          this._router.navigate(['/']).then();
        }, error => {
          console.log(error);
        });
    }
  }

  onRegisterStep1() {
    this.resetErrorLabels();
    this.checkFirstName();
    this.checkLastName();
    this.checkTelephone();
    if (!this.firstNameError && !this.lastNameError && !this.telephoneError) {
      console.log('Step 1 of register successful:', {
        firstName: this.firstName,
        lastName: this.lastName,
        telephone: this.telephone
      });
      this.changeForm('registerStep2');
    }
  }

  onRegisterStep2() {
    this.resetErrorLabels();
    this.checkEmail();
    this.checkPassword();
    this.checkConfirmPassword();
    if (!this.emailError && !this.passwordError && !this.confirmPasswordError) {
      console.log('Register successful:', {email: this.email, password: this.confirmPassword});
      this._router.navigate(['client']).then();
    }
  }

  onForgotPasswordEmail() {
    this.resetErrorLabels();
    this.checkEmail();
    if (!this.emailError) {
      console.log('First step of password reset successful:', {email: this.email, password: this.confirmPassword});
      this.changeForm('resetPassword');
    }
  }

  onResetPassword() {
    this.checkPassword();
    this.checkConfirmPassword();
    if (!this.passwordError && !this.confirmPasswordError) {
      console.log('Password reset successful:', {email: this.email, password: this.confirmPassword});
      this._router.navigate(['client']).then();
    }
  }

  changeForm(nextForm: typeof this.currentForm) {
    this.resetFields();
    this.resetErrorLabels();
    this.currentForm = nextForm;
  }

  resetFields() {
    // tranne le password, gli altri campi posso essere usati come 'auto-completamento'
    // this.firstName = '';
    // this.lastName = '';
    // this.telephone = '';
    // this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  private resetErrorLabels() {
    this.firstNameError = '';
    this.lastNameError = '';
    this.telephoneError = '';
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
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

  private checkTelephone() {
    if (!this.telephone) {
      this.telephoneError = 'Numero di telefono obbligatorio';
    } else if (!this.validatePhone(this.telephone)) {
      this.telephoneError = 'Formato numero di telefono non valido.';
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
        logo_alignment: "left",
        // width: "200"
      }
    );
  }

  handleGoogleLogin(response: any) {
    const userInfo = this.decodeJwtResponse(response.credential);
    console.log('Informazioni utente: ', userInfo);
    this.sendTokenToBackend(response.credential);
  }

  decodeJwtResponse(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  sendTokenToBackend(token: string) {
    this._authenticationService.onGoogleLogin(token).subscribe(
      () => {
        console.log('Google login completato.');
        this._router.navigate(['/']).then(() => this._authenticationService.getUser().subscribe());
      },
      (error) => {
        console.error('Errore nel Google login:', error);
      }
    );
  }
}
