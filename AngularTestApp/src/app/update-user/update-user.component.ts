import {
  Component,
  ElementRef,
  EventEmitter,
  Input, NgZone, OnChanges,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
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
export class UpdateUserComponent implements OnChanges {
  @Input() user!: any;
  @Input() profileImage!: Blob | null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() showImage = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  firstName: string = '';
  lastName: string = '';
  image: File | null = null;
  imageUrl: string = '';
  alertMessage: string = '';
  firstNameError: string = '';
  lastNameError: string = '';
  isLoading: boolean = false;
  imageError: string = '';
  profileImageChanged: boolean = false;

  constructor(private _clientService: ClientService, private ngZone: NgZone) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngZone.runOutsideAngular(() => {
      if (changes['user'] || changes['profileImage']) {
        this.resetData();
      }
    });
  }

  validateName(name: string) {
    return /^[a-zA-Zà-üÀ-Ü\s]*$/.test(name);
  }

  resetData() {
    this.firstName = this.user.firstName;
    this.lastName = this.user.lastName;
    this.resetProfileImage();
    this.alertMessage = '';
    this.firstNameError = '';
    this.lastNameError = '';
    this.imageError = '';
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
          error: (error) => {
            this.isLoading = false;
            this.alertMessage = error.message;
          }
        }
      );
    }
  }

  onFileSelect(event: any) {
    this.checkAndAddImage(event.target.files[0]);
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
    this.checkAndAddImage(event.dataTransfer?.files[0]);
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

  private checkAndAddImage(file: File | undefined) {
    if (file?.type.startsWith('image/')) {
      this.image = file;
      this.imageUrl = URL.createObjectURL(file);
      this.profileImageChanged = true;
    } else {
      this.imageError = 'Sono consentite solo immagini';
    }
  }

  removeImage() {
    this.image = null;
    this.imageUrl = '';
    this.profileImageChanged = true;
  }

  private resetProfileImage() {
    if (this.profileImage) {
      const file = new File([this.profileImage], 'profile-image');
      this.image = file;
      this.imageUrl = URL.createObjectURL(file);
    } else {
      this.image = null;
      this.imageUrl = '';
    }
    this.profileImageChanged = false;
  }
}
