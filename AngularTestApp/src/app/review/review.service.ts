import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {Review} from '../models/review/review.module';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private APIUrl = "api";

  constructor(private http: HttpClient) {
  }

  getAllReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.APIUrl}/open/v1/reviews`);
  }

  // Recupera recensioni di un determinato viaggio
  getReviewsByTravel(travelId: number): Observable<Review[]> {
    const params = new HttpParams().set('travelId', travelId.toString());
    return this.http.get<Review[]>(`${this.APIUrl}/open/v1/reviews-by-travel`, {params});
  }

  // Recupera recensioni di un determinato utente
  getReviewsByUser(email: string): Observable<Review[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<Review[]>(`${this.APIUrl}/open/v1/reviews-by-user`, {params});
  }

  // Recupera una recensione specifica
  getReview(travelId: number, email: string): Observable<Review> {
    const params = new HttpParams()
      .set('travelId', travelId.toString())
      .set('email', email);
    return this.http.get<Review>(`${this.APIUrl}/open/v1/review`, {params});
  }

  // Crea una nuova recensione
  createReview(review: Review): Observable<void> {
    console.log(review);
    return this.http.post<void>(`${this.APIUrl}/open/v1/create-review`, review).pipe(
      catchError(error => {
        console.error('HTTP error response:', error); // Log completo
        return throwError(() => new Error('Failed to create review. Check the console for details.'));
      })
    );
  }

  // Aggiorna una recensione esistente
  updateReview(review: Review): Observable<void> {
    return this.http.put<void>(`${this.APIUrl}/open/v1/update-review`, review, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    });
  }

  // Elimina una recensione specifica
  deleteReview(travelId: number, email: string): Observable<void> {
    const params = new HttpParams()
      .set('travelId', travelId.toString())
      .set('email', email);
    return this.http.delete<void>(`${this.APIUrl}/open/v1/delete-review`, {params});
  }

  // Conta il numero di recensioni di un determinato utente
  countReviewsByUser(email: string): Observable<number> {
    const params = new HttpParams().set('email', email);
    return this.http.get<number>(`${this.APIUrl}/open/v1/reviews-count`, {params});
  }
}
