import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<{ message: string | null, isSuccess: boolean | null }>({
    message: null,
    isSuccess: null
  });
  private isExitingSubject = new BehaviorSubject<boolean>(false);
  alert$ = this.alertSubject.asObservable();
  isExiting$ = this.isExitingSubject.asObservable();

  showAlert(message: string, isSuccess: boolean) {
    this.alertSubject.next({message, isSuccess});
    this.isExitingSubject.next(false);
    setTimeout(() => {
      this.isExitingSubject.next(true);
      setTimeout(() => {
        this.alertSubject.next({message: null, isSuccess: null});
      }, 500);
    }, 2000);
  }

}
