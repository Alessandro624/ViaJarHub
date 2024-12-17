import {Component, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Travel} from '../models/travel/travel.module';
import {TravelService} from '../travel.service';

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
  travel: Travel = {
    id: 0,
    destinazione: '',
    dataPartenza: '',
    dataRitorno: '',
    descrizione: '',
    prezzo: 0,
    postiDisponibile: 0,
    tipo: '',
    numeroStelle: 0,
    immagini: []
  };
  dateErrors = {startDateInvalid: false, endDateInvalid: false};

  constructor(private travelService: TravelService) {
  }

  resetData() {
    this.travel = {
      id: 0,
      destinazione: '',
      dataPartenza: '',
      dataRitorno: '',
      descrizione: '',
      prezzo: 0,
      postiDisponibile: 0,
      tipo: '',
      numeroStelle: 0,
      immagini: []
    };
    this.dateErrors = {startDateInvalid: false, endDateInvalid: false};
  }

  onSubmit() {
    console.log('Dati del form:', this.travel);
    console.log('Immagini caricate:', this.travel.immagini);

    // Mostra conferma e chiudi il modale
    alert(`Form inviato con successo!\nDestinazione: ${this.travel.destinazione}\nData di Partenza: ${this.travel.dataPartenza}\nData di Ritorno: ${this.travel.dataRitorno}\nDescrizione: ${this.travel.descrizione}\nNumero di immagini: ${this.travel.immagini.length}`);
    this.closeModal.emit();
    this.resetData();
  }

  validateAndFormatPrice(event: any) {
    const input = event.target.value;
    const pricePattern = /^\d*\.?\d*$/;
    if (!pricePattern.test(input)) {
      event.target.value = input.slice(0, -1);
    } else {
      this.travel.prezzo = input;
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
    const startDate = new Date(this.travel.dataPartenza);
    const endDate = new Date(this.travel.dataRitorno); // Controlla se la data di partenza è minore di oggi (solo se una data di partenza è stata inserita) if (this.formData.startDate) { this.dateErrors.startDateInvalid = startDate < today.setHours(0, 0, 0, 0); } else { this.dateErrors.startDateInvalid = false; } // Controlla se la data di ritorno è minore della data di partenza (solo se entrambe le date sono state inserite)
    if (this.travel.dataPartenza && this.travel.dataRitorno) {
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
    this.travel.tipo = tipo;
  }

  addTravel() {
    // TODO aggiungere logica per modificare le date prima di inviarle nel formato dd/mm/yyyy
    this.travelService.addTravel(this.travel);

  }
}
