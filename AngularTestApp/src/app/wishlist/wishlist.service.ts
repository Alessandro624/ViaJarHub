import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, of, switchMap, throwError} from 'rxjs';
import {Travel} from '../models/travel/travel.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private APIUrl: string = "api";
  private currentWishlistSubject = new BehaviorSubject<Travel[] | null>(null);
  wishlist$ = this.currentWishlistSubject.asObservable();

  constructor(private _http: HttpClient) {
    this.getWishlist().subscribe();
  }

  getWishlist() {
    return this._http.get<Travel[]>(`${this.APIUrl}/auth/v1/wishlist`).pipe(
      switchMap((wishlist) => {
        this.currentWishlistSubject.next(wishlist);
        return of(wishlist);
      }),
      catchError(() => {
        this.currentWishlistSubject.next(null);
        return of(null);
      })
    );
  }

  addToWishlist(id: number) {
    return this._http.post(`${this.APIUrl}/auth/v1/add-to-wishlist?travelId=${id}`, {}).pipe(
      switchMap(() => this.getWishlist()),
      catchError(this.handleError)
    );
  }

  removeFromWishlist(id: number) {
    return this._http.delete(`${this.APIUrl}/auth/v1/remove-from-wishlist?travelId=${id}`).pipe(
      switchMap(() => this.getWishlist()),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore, riprovare più tardi';
    switch (error.status) {
      case 400:
        errorMessage = 'Impossibile effettuare la richiesta, riprovare più tardi';
        break;
      default:
        errorMessage = 'Si è verificato un errore, riprovare più tardi';
    }
    return throwError(() => new Error(errorMessage));
  }
}
