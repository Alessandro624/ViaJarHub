import {Component} from '@angular/core';
import {AlertService} from './alert.service';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [
    NgIf,
    NgClass
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
  message: string | null = null;
  isExiting: boolean = false;
  isSuccess: boolean | null = null;

  constructor(private alertService: AlertService) {
    this.alertService.alert$.subscribe((alert) => {
      this.message = alert.message;
      this.isSuccess = alert.isSuccess;
    });
    this.alertService.isExiting$.subscribe((exiting) => {
      this.isExiting = exiting;
    });
  }
}
