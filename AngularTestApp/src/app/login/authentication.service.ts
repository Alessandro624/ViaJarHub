import {Injectable} from '@angular/core';
import {User} from '../models/user/user.model';
import {BehaviorSubject, catchError, of, switchMap, throwError} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private APIUrl = "api";

  constructor(private _http: HttpClient) {
    this.getUser().subscribe();
  }

  onLogin(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    return this._http.post<void>(`${this.APIUrl}/login`, body.toString(), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      withCredentials: true
    }).pipe(
      switchMap(() => this.getUser()),
      catchError(this.handleError)
    );
  }

  onRegister(email: string, password: string, firstName: string, lastName: string, birthDate: Date) {
    const body = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      birthDate: birthDate
    };
    return this._http.post<void>(`${this.APIUrl}/open/v1/register`, body, {withCredentials: true}).pipe(catchError(this.handleError));
  }

  onGoogleLogin(token: string) {
    return this._http.post<void>(`${this.APIUrl}/open/v1/google-login`, {token}, {withCredentials: true}).pipe(
      switchMap(() => this.getUser()),
      catchError(this.handleError)
    );
  }

  onLogout() {
    return this._http.post<void>(`${this.APIUrl}/logout`, {}, {withCredentials: true}).pipe(
      switchMap(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  getUser() {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }
    return this._http.get<User>(`${this.APIUrl}/auth/v1/check-user`, {withCredentials: true}).pipe(
      switchMap((user) => {
        this.currentUserSubject.next(user);
        return of(user);
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  sendVerificationToken(token: string) {
    return this._http.get<void>(`${this.APIUrl}/open/v1/verify-email?token=${token}`, {withCredentials: true}).pipe(catchError(this.handleError));
  }

  onForgotPassword(email: string) {
    const body = new URLSearchParams();
    body.set('email', email);
    return this._http.post<void>(`${this.APIUrl}/open/v1/forgot-password`, body.toString(), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  validatePasswordResetToken(token: string) {
    return this._http.get<void>(`${this.APIUrl}/open/v1/check-reset-token?token=${token}`, {withCredentials: true}).pipe(catchError(this.handleError));
  }

  onResetPassword(token: string, newPassword: string) {
    const body = new URLSearchParams();
    body.set('newPassword', newPassword);
    return this._http.post<void>(`${this.APIUrl}/open/v1/reset-password?token=${token}`, body.toString(), {
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore, riprovare più tardi';
    switch (error.status) {
      case 400:
        errorMessage = 'Impossibile effettuare la richiesta, riprovare più tardi';
        break;
      case 401:
        errorMessage = 'Credenziali errate';
        break;
      case 404:
        errorMessage = 'Errore nell\'accesso';
        break;
      case 409:
        errorMessage = 'Errore nella registrazione';
        break;
      case 503:
        errorMessage = 'Servizio non disponibile, riprovare più tardi';
        break;
      default:
        errorMessage = 'Si è verificato un errore, riprovare più tardi';
    }
    return throwError(() => new Error(errorMessage));
  }
}
