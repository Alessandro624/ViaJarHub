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
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  emailError: string = '';
  recoveryEmail: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  currentForm: 'login' | 'register' | 'forgotPasswordEmail' | 'resetPassword' = 'login';
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

  onLogin() {
    this.resetErrorLabels();
    this.checkEmail();
    this.checkPassword();
    if (!this.emailError && !this.passwordError) {
      console.log('Login successful:', {email: this.email, password: this.password});
      this._router.navigate(['client']).then();
    }
  }

  onRegister() {
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

  changeForm(nextForm: "login" | "register" | "forgotPasswordEmail" | "resetPassword") {
    this.resetFields();
    this.resetErrorLabels();
    this.currentForm = nextForm;
  }

  resetFields() {
    this.email = '';
    this.recoveryEmail = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  private resetErrorLabels() {
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
  }

  private checkEmail() {
    if (!this.validateEmail(this.email)) {
      this.emailError = 'Formato email non valido.';
    }
  }

  private checkPassword() {
    if (!this.validatePassword(this.password)) {
      this.passwordError = 'La password deve contenere almeno 8 caratteri, un numero, una maiuscola e un carattere speciale.';
    }
  }

  private checkConfirmPassword() {
    if (this.password !== this.confirmPassword) {
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

  preventClose($event: MouseEvent) {
    $event.preventDefault();
  }
}
