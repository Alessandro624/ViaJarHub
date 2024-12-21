import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {switchMap} from 'rxjs';
import {AuthenticationService} from '../../login/authentication.service';

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
      switchMap(() => this._authenticationService.getUser())
    );
  }

  getUserProfileImage() {
    return this._http.get(`${this.APIUrl}/auth/v1/profile-image`, {
      responseType: 'blob'
    });
  }
}
