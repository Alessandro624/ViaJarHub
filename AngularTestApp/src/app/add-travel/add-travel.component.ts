import {Component, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Travel} from '../models/travel/travel.model';
import {TravelService} from '../travel-detail/travel.service';

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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;//consente di accedere all'elemento del DOM
  today: string = new Date().toISOString().split('T')[0];
  travel: Travel = {
    id: 0,
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    oldPrice: 0,
    price: 0,
    maxParticipantsNumber: 0,
    travelType: '',
    numeroStelle: 0,
    immagini: [],
    latitude: 0,
    longitude: 0
  };
  dateErrors = {startDateInvalid: false, endDateInvalid: false};

  constructor(private travelService: TravelService) {
  }

  resetData() {
    this.travel = {
      id: 0,
      destination: '',
      startDate: '',
      endDate: '',
      description: '',
      oldPrice: 0,
      price: 0,
      maxParticipantsNumber: 0,
      travelType: '',
      numeroStelle: 0,
      immagini: [],
      latitude: 0,
      longitude: 0
    };
    this.dateErrors = {startDateInvalid: false, endDateInvalid: false};
  }

  onSubmit() {
    console.log('Dati del form:', this.travel);
    console.log('Immagini caricate:', this.travel.immagini);

    // Mostra conferma e chiudi il modale
    alert(`Form inviato con successo!\nDestinazione: ${this.travel.destination}\nData di Partenza: ${this.travel.startDate}\nData di Ritorno: ${this.travel.endDate}\nDescrizione: ${this.travel.description}\nNumero di immagini: ${this.travel.immagini.length}`);
    this.closeModal.emit();
    this.resetData();
  }

  validateAndFormatPrice(event: any) {
    const input = event.target.value;
    const pricePattern = /^\d*\.?\d*$/;
    if (!pricePattern.test(input)) {
      event.target.value = input.slice(0, -1);
    } else {
      this.travel.price = input;
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
    const startDate = new Date(this.travel.startDate);
    const endDate = new Date(this.travel.endDate); // Controlla se la data di partenza è minore di oggi (solo se una data di partenza è stata inserita) if (this.formData.startDate) { this.dateErrors.startDateInvalid = startDate < today.setHours(0, 0, 0, 0); } else { this.dateErrors.startDateInvalid = false; } // Controlla se la data di ritorno è minore della data di partenza (solo se entrambe le date sono state inserite)
    if (this.travel.startDate && this.travel.endDate) {
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
      this.travel.immagini.push(files[i]);
    }
  }

  removeImage(index: number) {
    this.travel.immagini.splice(index, 1);
  }

  selectType(tipo: string) {
    this.travel.travelType = tipo;
  }

  addTravel() {
    // TODO aggiungere logica per modificare le date prima di inviarle nel formato dd/mm/yyyy
    this.travelService.addTravel(this.travel);

  }
}
