//TODO controllo solo caratteri input nome e cognome
import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {formatDate, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  formData = {nome: '', cognome: '', image: null as File | null};

  dateErrors = {startDateInvalid: false, endDateInvalid: false};

  resetData() {
    this.formData = {nome: '', cognome: '', image: null,};
    this.dateErrors = {startDateInvalid: false, endDateInvalid: false};
  }

  onSubmit() {
    console.log('Dati del form:', this.formData);

    // Mostra conferma e chiudi il modale
    alert(`Form inviato con successo!\nNome: ${this.formData.nome}\nCognome: ${this.formData.cognome}\nImmagine: ${this.formData.image}`);
    this.closeModal.emit();
    this.resetData();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    this.formData.image = file;
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
    if (file) {
      this.formData.image = file;

    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click(); // Attiva l'input file nascosto
  }


  hasDateErrors(): boolean {
    return this.dateErrors.startDateInvalid || this.dateErrors.endDateInvalid;
  }


  protected readonly formatDate = formatDate;
}
