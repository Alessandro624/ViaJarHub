import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {ClientService} from '../profile/client/client.service';
import {FormsModule} from '@angular/forms';
import {AlertService} from '../alert/alert.service';

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
  selectedIndex: number = -1;

  constructor(private _clientService: ClientService, private alertService: AlertService) {
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
    this.selectedIndex = -1;
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
          this.alertService.showAlert("Utente reso admin con successo", true);
        }, error: error => {
          this.isLoading = false;
          this.alertMessage = error.message;
        }
      });
    }
  }

  private validateEmail(email: string) {
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

  handleKeyDown($event: KeyboardEvent) {
    switch ($event.key) {
      case 'ArrowDown':
        if (this.filteredEmails.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredEmails.length;
        this.scrollToActiveItem();
        $event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.filteredEmails.length === 0) return;
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredEmails.length) % this.filteredEmails.length;
        this.scrollToActiveItem();
        $event.preventDefault();
        break;
      case 'Enter':
        if (this.selectedIndex >= 0) {
          this.selectEmail(this.filteredEmails[this.selectedIndex]);
        }
        $event.preventDefault();
        break;
      case 'Escape':
        this.selectEmail('');
        const input = $event.target as HTMLInputElement;
        input.blur();
        break;
    }
  }

  private scrollToActiveItem() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    if (this.selectedIndex >= 0 && this.selectedIndex < dropdownItems.length) {
      const activeItem = dropdownItems[this.selectedIndex + 1] as HTMLElement;
      activeItem.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
    }
  }
}
