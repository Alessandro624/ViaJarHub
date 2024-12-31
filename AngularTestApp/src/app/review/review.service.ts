import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of, switchMap} from 'rxjs';
import {Review} from '../models/review/review.module';
import {Travel} from '../models/travel/travel.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private APIUrl = "api";
  // starsHTML: string = '';
  private currentReviewableSubject = new BehaviorSubject<Travel[] | null>(null);
  reviewable$ = this.currentReviewableSubject.asObservable();

  constructor(private http: HttpClient) {
    this.getReviewable().subscribe();
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
      switchMap(() => this.getReviewable()));
  }

  getReviewImages(id: number, email: string | undefined): Observable<string[]> {
    return this.http.get<string[]>(`${this.APIUrl}/open/v1/review-images?id=${id}&email=${email}`).pipe();
  }

  // Aggiorna una recensione esistente
  /*updateReview(review: Review): Observable<void> {
    return this.http.put<void>(`${this.APIUrl}/open/v1/update-review`, review, {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }).pipe(
      switchMap(() => this.getReviewable()));;
  }*/

  // Elimina una recensione specifica
  deleteReview(review: Review) {
    review.user.authorities = null;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
    return this.http.delete<void>(`${this.APIUrl}/auth/v1/delete-review`, {headers, body: review}).pipe(
      switchMap(() => this.getReviewable()));
  }

  // Conta il numero di recensioni di un determinato utente
  countReviewsByUser(email: string): Observable<number> {
    const params = new HttpParams().set('email', email);
    return this.http.get<number>(`${this.APIUrl}/open/v1/reviews-count`, {params});
  }
}
