import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private APIUrl = "api";

  constructor(private http: HttpClient) {
  }

  getMap(coordinates: { latitude: number; longitude: number }): Observable<any> {
    return this.http.post(`${this.APIUrl}/open/v1/map`, coordinates);
  }
}
