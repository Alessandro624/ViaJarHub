import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ClientService} from '../profile/client/client.service';
import {ContactMessage} from '../models/contact/contact.model';
import {FormsModule} from '@angular/forms';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-contact-modal',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgClass,
    NgStyle
  ],
  templateUrl: './contact-modal.component.html',
  styleUrl: './contact-modal.component.css'
})
export class ContactModalComponent {
  @Input() isPopupVisible!: boolean;
  @Output() closePopup = new EventEmitter<void>();
  message: ContactMessage = {
    subject: '',
    body: ''
  };
  alertMessage = '';
  subjectError = '';
  bodyError = '';
  isLoading: boolean = false;

  constructor(private _clientService: ClientService, private alertService: AlertService) {
  }

  sendEmail() {
    this.validateEmail()
    if (!this.bodyError && !this.subjectError) {
      this.isLoading = true;
      this._clientService.sendContactEmail(this.message).subscribe({
          next: () => {
            this.isLoading = false;
            this.resetEmail();
            this.closePopup.emit();
            this.alertService.showAlert("Email inviata con successo", true);
          }, error: error => {
            this.isLoading = false;
            this.alertMessage = error.message;
          }
        }
      );
    }
  }

  resetEmail() {
    this.message = {
      subject: '',
      body: ''
    };
    this.alertMessage = '';
    this.subjectError = '';
    this.bodyError = '';
    this.isLoading = false;
  }

  private validateEmail() {
    if (!this.message.subject) {
      this.subjectError = 'L\'oggetto non può essere vuoto';
    }
    if (!this.message.body) {
      this.bodyError = 'Il messaggio non può essere vuoto';
    }
  }
}
