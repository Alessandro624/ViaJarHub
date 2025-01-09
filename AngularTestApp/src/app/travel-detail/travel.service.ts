import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Travel} from '../models/travel/travel.model';

import {catchError, Observable, switchMap, throwError} from 'rxjs';
import {TravelFilter} from '../models/travel/travel-filter.model';
import {AuthenticationService} from '../login/authentication.service';
import {UserRole} from '../models/user/user-role.enum';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  APIUrl = "api";

  constructor(private _http: HttpClient, private _authenticationService: AuthenticationService, private _router: Router) {

  }

  private checkUserAuthority() {
    return this._authenticationService.currentUser$;
  }

  private getAPIType(user: any): string {
    return user?.authorities[0].authority === UserRole.ADMIN ? 'admin' : 'open';
  }

  getTravelsPaginated(offset: number, limit: number, filters: TravelFilter) {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.post<Travel[]>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/travels-paginated`,
          {offset, limit, filters}
        )
      ),
      catchError(this.handleError)
    );
  }

  getTravelsCount(filters: TravelFilter) {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.post<number>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/travels-count`,
          {filters}
        )
      ),
      catchError(this.handleError)
    );
  }

  addTravel(travel: Travel, images: File[]) {
    const formData = new FormData();
    formData.append('travel', new Blob([JSON.stringify(travel)], {type: 'application/json'}));
    images.forEach(image => formData.append('travelImages', image));
    return this._http.post(`${this.APIUrl}/admin/v1/create-travel`, formData).pipe(
      catchError(this.handleError)
    );
  }

  getTravelById(id: number) {
    if (isNaN(id)) {
      this._router.navigate(['**']).then();
    }
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.get<Travel>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/travel?id=${id}`
        )
      ),
      catchError(this.handleError)
    );
  }

  getSuggestions(filters: TravelFilter) {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.post<string[]>(`${this.APIUrl}/${this.getAPIType(user)}/v1/suggestions`, filters)),
      catchError(this.handleError)
    )
  }

  getStars(id: number) {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.get<number>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/stars?id=${id}`
        )
      ),
      catchError(this.handleError)
    );
  }

  getMaxPrice(): Observable<number> {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.get<number>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/max-price`
        )
      ),
      catchError(this.handleError)
    );
  }

  getMostRated(): Observable<Travel[]> {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.get<Travel[]>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/most-rated`
        )
      ),
      catchError(this.handleError)
    );
  }

  getTravelNumber(): Observable<number> {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.get<number>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/all-travel-number`
        )
      ),
      catchError(this.handleError)
    );
  }

  getTravelImages(id: number) {
    return this.checkUserAuthority().pipe(
      switchMap(user =>
        this._http.get<string[]>(
          `${this.APIUrl}/${this.getAPIType(user)}/v1/travel-images?id=${id}`
        )
      ),
      catchError(this.handleError)
    );
  }

  getAvailableSeats(travel: Travel) {
    return this._http.post<number>(`${this.APIUrl}/open/v1/available-seats`, travel).pipe(
      catchError(this.handleError)
    )
  }

  updateTravel(id: number, travel: Travel, images: File[]) {
    const formData = new FormData();
    formData.append('travel', new Blob([JSON.stringify(travel)], {type: 'application/json'}));
    images.forEach(image => formData.append('travelImages', image));
    return this._http.post(`${this.APIUrl}/admin/v1/update-travel?id=${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteTravel(id: number) {
    return this._http.delete(`${this.APIUrl}/admin/v1/delete-travel?id=${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Si è verificato un errore, riprovare più tardi';
    switch (error.status) {
      case 400:
        errorMessage = 'Impossibile effettuare la richiesta, riprovare più tardi';
        break;
      case 403:
        errorMessage = 'Non autorizzato';
        break;
      case 404:
        errorMessage = 'Viaggio non trovato';
        // console.error(errorMessage);
        // this._router.navigate(['**']); // Ora funziona
        break;
      case 409:
        errorMessage = 'Errore nella creazione del viaggio';
        break;
      default:
        errorMessage = 'Si è verificato un errore, riprovare più tardi';
    }
    return throwError(() => new Error(errorMessage));
  };
}
