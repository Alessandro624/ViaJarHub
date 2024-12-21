import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private APIUrl = "api";

  constructor(private http: HttpClient,) {

  }

  makePayment(paymentData: Object): Observable<any> {
    return this.http.post(`${this.APIUrl}/auth/v1/payment`, paymentData);
  }


}
