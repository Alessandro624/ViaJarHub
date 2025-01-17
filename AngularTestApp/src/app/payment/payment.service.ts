import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of, switchMap} from 'rxjs';
import {Travel} from '../models/travel/travel.model';
import {WishlistService} from '../wishlist/wishlist.service';
import {AuthenticationService} from '../login/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private APIUrl = "api";
  private currentBookingSubject = new BehaviorSubject<Travel[] | null>(null);
  booking$ = this.currentBookingSubject.asObservable();

  constructor(private http: HttpClient, private _wishlistService: WishlistService, private _authenticationService: AuthenticationService) {
    this._authenticationService.currentUser$.subscribe(() => {
      this.getBooking().subscribe();
    });
  }

  makePayment(paymentData: Object): Observable<any> {
    return this.http.post(`${this.APIUrl}/auth/v1/payment`, paymentData).pipe(
      switchMap(() => this.getBooking()),
      switchMap(() => this._wishlistService.getWishlist()),
    );
  }

  getBooking() {
    return this.http.get<Travel[]>(`${this.APIUrl}/auth/v1/booking`).pipe(
      switchMap((booking) => {
        this.currentBookingSubject.next(booking);
        return of(booking);
      }),
      catchError(() => {
        this.currentBookingSubject.next(null);
        return of(null);
      })
    );
  }

  getDailyIncome() {
    return this.http.get<number>(`${this.APIUrl}/admin/v1/daily-income`).pipe();
  }

  getMonthlyIncome() {
    return this.http.get<number>(`${this.APIUrl}/admin/v1/monthly-income`).pipe();
  }

  getAnnualIncome() {
    return this.http.get<number>(`${this.APIUrl}/admin/v1/annual-income`).pipe();
  }

  getAllIncome() {
    return this.http.get<number>(`${this.APIUrl}/admin/v1/all-income`).pipe();

  }

  getMonthlyBooking(mese: number) {
    return this.http.get<number>(`${this.APIUrl}/admin/v1/get-monthly-booking?month=${mese}`).pipe()
  }
}
