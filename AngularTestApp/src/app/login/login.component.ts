import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

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
  recoveryEmail: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  currentForm: 'login' | 'registerStep1' | 'registerStep2' | 'forgotPasswordEmail' | 'resetPassword' = 'login';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private _router: Router) {
  }

  ngOnInit(): void {
    this.changeForm('login');
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
      console.log('Login successful:', {email: this.email, password: this.password});
      this._router.navigate(['client']).then();
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
      const tempEmail = this.email;
      console.log('First step of password reset successful:', {email: this.email, password: this.confirmPassword});
      this.changeForm('resetPassword');
      this.recoveryEmail = tempEmail;
    }
  }

  onResetPassword() {
    this.checkPassword();
    this.checkConfirmPassword();
    if (!this.passwordError && !this.confirmPasswordError) {
      console.log('Password reset successful:', {email: this.recoveryEmail, password: this.confirmPassword});
      this._router.navigate(['client']).then();
    }
  }

  changeForm(nextForm: typeof this.currentForm) {
    this.resetFields();
    this.resetErrorLabels();
    this.currentForm = nextForm;
  }

  resetFields() {
    // TODO tranne le password, gli campi posso essere usati come 'auto-completamento'
    // this.firstName = '';
    // this.lastName = '';
    // this.telephone = '';
    // this.email = '';
    this.recoveryEmail = '';
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
}
