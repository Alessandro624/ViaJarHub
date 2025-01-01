import {Component, EventEmitter, HostListener, Input, NgZone, OnInit, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {ClientService} from '../profile/client/client.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-make-admin-modal',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    NgIf,
    FormsModule,
    NgForOf
  ],
  templateUrl: './make-admin-modal.component.html',
  styleUrl: './make-admin-modal.component.css'
})
export class MakeAdminModalComponent implements OnInit {
  @Input() isMakeAdminVisible!: boolean;
  @Output() closeMakeAdminPopup = new EventEmitter<unknown>();
  isLoading: boolean = false;
  email: string = "";
  alertMessage: string = "";
  emailError: string = "";
  emails: string[] = [];
  filteredEmails: string[] = [];
  isInputFocused: boolean = false;

  constructor(private _clientService: ClientService) {
  }

  ngOnInit(): void {
    this._clientService.emails$.subscribe({
        next: data => {
          if (data) {
            this.emails = data;
            this.filteredEmails = data;
          }
        }, error: error => {
          this.alertMessage = error.message;
        }
      }
    )
  }

  resetEmail() {
    this.email = "";
    this.emailError = "";
    this.alertMessage = "";
    this.isLoading = false;
    this.filteredEmails = [...this.emails];
  }

  onSubmit() {
    this.checkEmail();
    if (!this.emailError) {
      this.isLoading = true;
      this._clientService.makeAdmin(this.email).subscribe({
        next: () => {
          this.isLoading = false;
          this.resetEmail();
          this.closeMakeAdminPopup.emit();
          alert("Utente reso admin con successo");
        }, error: error => {
          this.isLoading = false;
          this.alertMessage = error.message;
          console.log(error);
        }
      });
    }
  }

  validateEmail(email: string) {
    return /^[A-z0-9.+_-]+@[A-z0-9._-]+\.[A-z]{2,6}$/.test(email);
  }

  private checkEmail() {
    if (!this.email) {
      this.emailError = 'Email obbligatoria';
    } else if (!this.validateEmail(this.email)) {
      this.emailError = 'Formato email non valido.';
    }
  }

  selectEmail(suggestion: string) {
    this.email = suggestion;
    this.filteredEmails = [];
    this.isInputFocused = false
  }

  onEmailInput() {
    this.emailError = '';
    this.alertMessage = '';
    this.filterEmails();
  }

  private filterEmails() {
    const query = this.email.toLowerCase();
    this.filteredEmails = this.emails.filter(email => email.toLowerCase().includes(query));
    console.log(this.filteredEmails);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdownClicked = target.closest('.dropdown-menu');
    const inputClicked = target.closest('#email');
    if (!dropdownClicked && !inputClicked) {
      this.isInputFocused = false;
    }
  }

  onFocus() {
    this.isInputFocused = true;
  }
}
