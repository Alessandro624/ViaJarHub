import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {ClientService} from '../profile/client/client.service';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  @Input() user!: any;
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  firstName: string = '';
  lastName: string = '';
  image: File | null = null;
  alertMessage: string = '';
  firstNameError: string = '';
  lastNameError: string = '';
  isLoading: boolean = false;
  @Output() showImage = new EventEmitter<void>();

  constructor(private _clientService: ClientService) {
  }

  ngOnInit(): void {
    this.resetData();
  }

  validateName(name: string) {
    return /^[a-zA-Zà-üÀ-Ü\s]*$/.test(name);
  }

  resetData() {
    this.firstName = this.user.firstName;
    this.lastName = this.user.lastName;
    this.alertMessage = '';
    this.firstNameError = '';
    this.lastNameError = '';
    this.image = null;
  }

  onSubmit() {
    this.checkFirstName();
    this.checkLastName();
    console.log('Dati del form:', this.firstName, this.lastName, this.image);
    if (!this.firstNameError && !this.lastNameError) {
      this.isLoading = true;
      this._clientService.updateUtente(this.user.email, this.firstName, this.lastName, this.image).subscribe(
        {
          next: () => {
            this.isLoading = false;
            alert(`Form inviato con successo!\nNome: ${this.firstName}\nCognome: ${this.lastName}\nImmagine: ${this.image}`);
            this.updateUser();
            this.resetData();
            this.closeModal.emit();
          },
          error: () => {
            this.isLoading = false;
            this.alertMessage = "Errore nella modifica";
          }
        }
      );
    }
  }

  onFileSelect(event: any) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.image = file;
      } else {
        alert('Sono consentite solo immagini');
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) {
      this.image = file;
    } else {
      alert('Sono consentite solo immagini');
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  private checkFirstName() {
    if (!this.firstName) {
      this.firstNameError = 'Nome obbligatorio';
    } else if (!this.validateName(this.firstName)) {
      this.firstNameError = 'Il nome deve contenere solo lettere';
    }
  }

  private checkLastName() {
    if (!this.lastName) {
      this.lastNameError = 'Cognome obbligatorio';
    } else if (!this.validateName(this.lastName)) {
      this.lastNameError = 'Il cognome deve contenere solo lettere';
    }
  }

  private updateUser() {
    this.user.firstName = this.firstName;
    this.user.lastName = this.lastName;
    this.showImage.emit();
  }
}
