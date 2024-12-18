import {Injectable} from '@angular/core';
import {User} from '../models/user/user.model';
import {BehaviorSubject, catchError, of, switchMap} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  // TODO aggiunta richieste di registrazione e recupero password

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
      switchMap(() => this.getUser())
    );
  }

  onGoogleLogin(token: string) {
    return this._http.post<void>(`${this.APIUrl}/open/v1/google-login`, {token}, {withCredentials: true}).pipe(
      switchMap(() => this.getUser()),
      catchError(async () => null)
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
}
