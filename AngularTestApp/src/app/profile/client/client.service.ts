import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, of, switchMap, throwError} from 'rxjs';
import {AuthenticationService} from '../../login/authentication.service';
import {ContactMessage} from '../../models/contact/contact.model';
import {UserRole} from '../../models/user/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private APIUrl: string = "api";
  private currentEmailsSubject = new BehaviorSubject<string[] | null>(null);
  emails$ = this.currentEmailsSubject.asObservable();

  constructor(private _http: HttpClient, private _authenticationService: AuthenticationService) {
    this._authenticationService.currentUser$.subscribe((user) => {
      if (user && user.authorities[0].authority === UserRole.ADMIN) {
        this.getUsersEmails().subscribe();
      }
    });
  }

  updateUtente(email: string, firstName: string, lastName: string, image: File | null) {
    const formData = new FormData();
    const user = {email, firstName, lastName};
    formData.append('user', new Blob([JSON.stringify(user)], {type: 'application/json'}));
    if (image) {
      formData.append('profileImage', image);
    }
    return this._http.post<void>(`${this.APIUrl}/auth/v1/update-user`, formData, {withCredentials: true}).pipe(
      switchMap(() => this._authenticationService.getUser()),
      catchError(this.handleError)
    );
  }

  getUserProfileImage() {
    return this._http.get(`${this.APIUrl}/auth/v1/profile-image`, {
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  sendContactEmail(message: ContactMessage) {
    return this._http.post(`${this.APIUrl}/auth/v1/contact-admins`, message).pipe(catchError(this.handleError));
  }

  getUsersEmails() {
    return this._http.get<string[]>(`${this.APIUrl}/admin/v1/emails`).pipe(
      switchMap((emails) => {
        this.currentEmailsSubject.next(emails);
        return of(emails);
      }),
      catchError(() => {
        this.currentEmailsSubject.next(null);
        return of(null);
      }));
  }

  makeAdmin(email: string) {
    return this._http.post(`${this.APIUrl}/admin/v1/make-admin?email=${email}`, {}).pipe(
      switchMap(() => this.getUsersEmails()),
      catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore, riprovare più tardi';
    switch (error.status) {
      case 400:
        errorMessage = 'Impossibile effettuare la richiesta, riprovare più tardi';
        break;
      case 404:
        errorMessage = 'Errore nella modifica delle informazioni';
        break;
      default:
        errorMessage = 'Si è verificato un errore, riprovare più tardi';
    }
    return throwError(() => new Error(errorMessage));
  }
}
