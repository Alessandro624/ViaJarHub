//TODO scroll bar direttamente sul modulo
import {Component, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-add-travel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './add-travel.component.html',
  styleUrl: './add-travel.component.css'
})
export class AddTravelComponent {
  @Output() closeModal = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  today: string = new Date().toISOString().split('T')[0];
  formData = {title: '', startDate: '', endDate: '', description: '', price: null, seats: null};
  selectedImages: File[] = [];
  dateErrors = {startDateInvalid: false, endDateInvalid: false};

  resetData() {
    this.formData = {title: '', startDate: '', endDate: '', description: '', price: null, seats: null};
    this.selectedImages = [];
    this.dateErrors = {startDateInvalid: false, endDateInvalid: false};
  }

  onSubmit() {
    console.log('Dati del form:', this.formData);
    console.log('Immagini caricate:', this.selectedImages);

    // Mostra conferma e chiudi il modale
    alert(`Form inviato con successo!\nTitolo: ${this.formData.title}\nData di Partenza: ${this.formData.startDate}\nData di Ritorno: ${this.formData.endDate}\nDescrizione: ${this.formData.description}\nNumero di immagini: ${this.selectedImages.length}`);
    this.closeModal.emit();
    this.resetData();
  }

  validateAndFormatPrice(event: any) {
    const input = event.target.value;
    const pricePattern = /^\d*\.?\d*$/;
    if (!pricePattern.test(input)) {
      event.target.value = input.slice(0, -1);
    } else {
      this.formData.price = input;
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    this.addFiles(files);
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
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(files);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click(); // Attiva l'input file nascosto
  }

  validateDates() {
    const today = new Date();
    const startDate = new Date(this.formData.startDate);
    const endDate = new Date(this.formData.endDate); // Controlla se la data di partenza è minore di oggi (solo se una data di partenza è stata inserita) if (this.formData.startDate) { this.dateErrors.startDateInvalid = startDate < today.setHours(0, 0, 0, 0); } else { this.dateErrors.startDateInvalid = false; } // Controlla se la data di ritorno è minore della data di partenza (solo se entrambe le date sono state inserite)
    if (this.formData.startDate && this.formData.endDate) {
      this.dateErrors.endDateInvalid = endDate < startDate;
    } else {
      this.dateErrors.endDateInvalid = false;
    }
  }

  hasDateErrors(): boolean {
    return this.dateErrors.startDateInvalid || this.dateErrors.endDateInvalid;
  }

  private addFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      this.selectedImages.push(files[i]);
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

}
