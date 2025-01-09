import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of, switchMap, throwError} from 'rxjs';


import {Travel} from '../models/travel/travel.model';
import {AuthenticationService} from '../login/authentication.service';
import {Review} from '../models/review/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private APIUrl = "api";
  private currentReviewableSubject = new BehaviorSubject<Travel[] | null>(null);
  reviewable$ = this.currentReviewableSubject.asObservable();

  constructor(private http: HttpClient, private _authenticationService: AuthenticationService) {
    this._authenticationService.currentUser$.subscribe(() => {
      this.getReviewable().subscribe();
    });
  }

  getReviewable() {
    return this.http.get<Travel[]>(`${this.APIUrl}/auth/v1/reviewable-booking`).pipe(
      switchMap((reviewable) => {
        this.currentReviewableSubject.next(reviewable);
        return of(reviewable);
      }),
      catchError(() => {
        this.currentReviewableSubject.next(null);
        return of(null);
      })
    );
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.APIUrl}/open/v1/reviews`).pipe(catchError(this.handleError));

  }

  // Recupera recensioni di un determinato viaggio
  getReviewsByTravel(travelId: number): Observable<Review[]> {
    const params = new HttpParams().set('travelId', travelId.toString());
    return this.http.get<Review[]>(`${this.APIUrl}/open/v1/reviews-by-travel`, {params}).pipe(catchError(this.handleError));
  }

  // Recupera recensioni di un determinato utente
  getReviewsByUser(email: string): Observable<Review[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Review[]>(`${this.APIUrl}/auth/v1/reviews-by-user`, {params}).pipe(catchError(this.handleError));
  }

  // Recupera una recensione specifica
  getReview(travelId: number, email: string): Observable<Review> {

    const params = new HttpParams()
      .set('travelId', travelId.toString())
      .set('email', email);
    return this.http.get<Review>(`${this.APIUrl}/open/v1/review`, {params}).pipe(catchError(this.handleError));


  }

  // Crea una nuova recensione
  createReview(review: Review, images: File[]) {
    review.user.authorities = null;
    const formData = new FormData();
    console.log(images);

    formData.append('review', new Blob([JSON.stringify(review)], {type: 'application/json'}));

    images.forEach((image) => {
      formData.append(`reviewImages`, image);
    });

    console.log(formData);
    return this.http.post<void>(`${this.APIUrl}/auth/v1/create-review`, formData).pipe(
      switchMap(() => this.getReviewable()),
      catchError(this.handleError));
  }

  getReviewImages(id: number, email: string | undefined): Observable<string[]> {
    return this.http.get<string[]>(`${this.APIUrl}/open/v1/review-images?id=${id}&email=${email}`).pipe(catchError(this.handleError));
  }


  // Elimina una recensione specifica
  deleteReview(review: Review) {
    review.user.authorities = null;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.delete<void>(`${this.APIUrl}/auth/v1/delete-review`, {headers, body: review}).pipe(
      switchMap(() => this.getReviewable()), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore, riprovare più tardi';

    switch (error.status) {
      case 400:
        errorMessage = 'Richiesta non valida. Verifica i dati inseriti.';
        break;
      case 401:
        errorMessage = 'Non sei autorizzato. Effettua il login per continuare.';
        break;
      case 403:
        errorMessage = 'Accesso negato. Non hai i permessi necessari.';
        break;
      case 404:
        errorMessage = 'Risorsa non trovata. Verifica i dati richiesti.';
        break;
      case 409:
        errorMessage = 'Conflitto nella richiesta. La risorsa potrebbe già esistere.';
        break;
      case 500:
        errorMessage = 'Errore interno del server. Riprovare più tardi.';
        break;
      default:
        errorMessage = 'Si è verificato un errore imprevisto. Riprova più tardi.';
    }

    return throwError(() => new Error(errorMessage));
  }
}
