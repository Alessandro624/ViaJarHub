import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, switchMap, throwError} from 'rxjs';
import {AuthenticationService} from '../../login/authentication.service';
import {ContactMessage} from '../../models/contact/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private APIUrl: string = "api";

  constructor(private _http: HttpClient, private _authenticationService: AuthenticationService) {
  }

  updateUtente(email: string, firstName: string, lastName: string, image: File | null) {
    const formData = new FormData();
    const user = {email, firstName, lastName};
    formData.append('user', new Blob([JSON.stringify(user)], {type: 'application/json'}));
    if (image) {
      formData.append('profileImage', image);
    }
    console.log(formData);
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
