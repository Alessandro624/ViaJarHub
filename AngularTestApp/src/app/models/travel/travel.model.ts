export interface Travel {
  id: number;
  destinazione: string;
  dataPartenza: string;
  dataRitorno: string;
  descrizione: string;
  prezzo: number;
  postiDisponibile: number;
  tipo: string;
  numeroStelle: number;
  immagini: File[];
  latitude: number;
  longitude: number;
}
