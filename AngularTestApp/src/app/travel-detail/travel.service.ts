import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Travel} from '../models/travel/travel.model';
import {catchError, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  APIUrl = "api";

  /*
    travels: Travel[] = [

      {
        id: 1,
        destinazione: 'Roma, Italia',
        dataPartenza: '10/01/2025',
        dataRitorno: '20/01/2025',
        descrizione: 'Un viaggio culturale nella capitale italiana. Esplora l\'imponente Colosseo, il magnifico Vaticano e i musei storici. Passeggia per le stradine di Trastevere e goditi l\'autentica cucina italiana nei suoi ristoranti pittoreschi. Scopri l\'arte e la storia di una città che ha influenzato il mondo intero.',
        prezzo: 1500,
        postiDisponibile: 10,
        tipo: 'Culturale',
        numeroStelle: 4,
        immagini: [],
        latitude: 41.9028,
        longitude: 12.4964
      },
      {
        id: 2,
        destinazione: 'Parigi, Francia',
        dataPartenza: '15/02/2025',
        dataRitorno: '25/02/2025',
        descrizione: 'Scopri la città dell\'amore. Ammira la Torre Eiffel illuminata di notte, visita il Louvre e perditi nelle sue opere d\'arte. Passeggia lungo la Senna, esplora Montmartre e gusta deliziosi croissant e caffè nei bistrot parigini. Parigi ti offre un\'esperienza romantica e culturale indimenticabile.',
        prezzo: 2000,
        postiDisponibile: 8,
        tipo: 'Romantico',
        numeroStelle: 5,
        immagini: [],
        latitude: 48.8566,
        longitude: 2.3522
      }, {
        id: 3,
        destinazione: 'New York, USA',
        dataPartenza: '05/03/2025',
        dataRitorno: '15/03/2025',
        descrizione: 'Visita la Grande Mela. Esplora Times Square con le sue luci sfavillanti, passeggia per Central Park e osserva la Statua della Libertà. Scopri i musei di fama mondiale come il MoMA e il Met. Vivi l\'energia unica di Broadway e gusta piatti internazionali nei quartieri di Manhattan.',
        prezzo: 2500,
        postiDisponibile: 12,
        tipo: 'Urbano',
        numeroStelle: 4,
        immagini: [],
        latitude: 40.7128,
        longitude: -74.0060
      }, {
        id: 4,
        destinazione: 'Tokyo, Giappone',
        dataPartenza: '10/04/2025',
        dataRitorno: '20/04/2025',
        descrizione: 'Esplora la cultura giapponese. Visita il tempio Senso-ji ad Asakusa, ammira la tecnologia avanzata ad Akihabara e rilassati nei giardini di Shinjuku Gyoen. Gusta il sushi più fresco nei mercati di Tsukiji e scopri la vivace vita notturna di Shibuya. Tokyo ti offre un mix perfetto di tradizione e modernità.',
        prezzo: 3000,
        postiDisponibile: 15,
        tipo: 'Culturale',
        numeroStelle: 5,
        immagini: [],
        latitude: 35.6895,
        longitude: 139.6917
      }, {
        id: 5,
        destinazione: 'Sydney, Australia',
        dataPartenza: '15/05/2025',
        dataRitorno: '25/05/2025',
        descrizione: 'Scopri le meraviglie australiane. Visita l\'Opera House e il Sydney Harbour Bridge. Passeggia per Bondi Beach e fai snorkeling nella Grande Barriera Corallina. Esplora il Taronga Zoo e scopri la fauna unica dell\'Australia. Sydney ti offre avventure emozionanti e paesaggi mozzafiato.',
        prezzo: 2700,
        postiDisponibile: 7,
        tipo: 'Avventura',
        numeroStelle: 4,
        immagini: [],
        latitude: -33.8688,
        longitude: 151.2093
      }, {
        id: 6,
        destinazione: 'Cairo, Egitto',
        dataPartenza: '10/06/2025',
        dataRitorno: '20/06/2025',
        descrizione: 'Visita le piramidi e il deserto. Ammira la Grande Piramide di Giza, visita il Museo Egizio e scopri i tesori di Tutankhamon. Fai un giro in cammello nel deserto e naviga sul Nilo. Il Cairo ti offre un viaggio affascinante nella storia antica e nelle meraviglie archeologiche.',
        prezzo: 1600,
        postiDisponibile: 20,
        tipo: 'Storico',
        numeroStelle: 3,
        immagini: [],
        latitude: 30.0444,
        longitude: 31.2357
      }, {
        id: 7,
        destinazione: 'Bangkok, Thailandia',
        dataPartenza: '05/07/2025',
        dataRitorno: '15/07/2025',
        descrizione: 'Esplora il cuore della Thailandia. Visita il maestoso Gran Palazzo, scopri i mercati galleggianti e fai un giro sui tuk-tuk. Gusta la cucina thailandese nei mercati notturni e rilassati nelle spiagge di Phuket. Bangkok ti offre un\'esperienza esotica e vibrante piena di cultura e avventura.',
        prezzo: 1800,
        postiDisponibile: 10,
        tipo: 'Esotico',
        numeroStelle: 4,
        immagini: [],
        latitude: 13.7563,
        longitude: 100.5018
      }, {
        id: 8,
        destinazione: 'Londra, Regno Unito',
        dataPartenza: '10/08/2025',
        dataRitorno: '20/08/2025',
        descrizione: 'Scopri la città di Londra. Visita il British Museum, ammira il Big Ben e il Parlamento, e fai un giro sul London Eye. Passeggia per Hyde Park e visita la Torre di Londra. Londra ti offre un mix unico di storia, cultura moderna e attrazioni turistiche iconiche.',
        prezzo: 2200,
        postiDisponibile: 9,
        tipo: 'Urbano',
        numeroStelle: 4,
        immagini: [],
        latitude: 51.5074,
        longitude: -0.1278
      }, {
        id: 9,
        destinazione: 'Mosca, Russia',
        dataPartenza: '05/09/2025',
        dataRitorno: '15/09/2025',
        descrizione: 'Esplora la storia russa. Visita la Piazza Rossa, il Cremlino e la Cattedrale di San Basilio. Scopri i tesori del Museo dell\'Hermitage e goditi un balletto al Teatro Bolshoi. Mosca ti offre un viaggio nella storia imperiale e nella cultura affascinante della Russia.',
        prezzo: 2300,
        postiDisponibile: 11,
        tipo: 'Storico',
        numeroStelle: 4,
        immagini: [],
        latitude: 55.7558,
        longitude: 37.6173
      }, {
        id: 10,
        destinazione: 'Rio de Janeiro, Brasile',
        dataPartenza: '10/10/2025',
        dataRitorno: '20/10/2025',
        descrizione: 'Vivi il carnevale brasiliano. Esplora le spiagge di Copacabana e Ipanema, ammira il Cristo Redentore sul Monte Corcovado e partecipa alle celebrazioni del carnevale. Rio de Janeiro ti offre un\'esperienza vibrante e festosa piena di colori, musica e danza.',
        prezzo: 2800,
        postiDisponibile: 14,
        tipo: 'Festivo',
        numeroStelle: 5,
        immagini: [],
        latitude: -22.9068,
        longitude: -43.1729
      }, {
        id: 11,
        destinazione: 'Dubai, Emirati Arabi Uniti',
        dataPartenza: '15/11/2025',
        dataRitorno: '25/11/2025',
        descrizione: 'Scopri il lusso di Dubai. Ammira l\'architettura futuristica del Burj Khalifa, fai shopping nei lussuosi centri commerciali e visita le isole artificiali di Palm Jumeirah. Partecipa a un safari nel deserto e rilassati nelle spiagge dorate. Dubai ti offre un\'esperienza unica di lusso e avventura.',
        prezzo: 3500,
        postiDisponibile: 8,
        tipo: 'Lusso',
        numeroStelle: 5,
        immagini: [],
        latitude: 25.276987,
        longitude: 55.296249
      }, {
        id: 12,
        destinazione: 'Singapore',
        dataPartenza: '05/12/2025',
        dataRitorno: '15/12/2025',
        descrizione: 'Visita la città del futuro. Ammira i supertree di Gardens by the Bay, scopri la vita marina al S.E.A. Aquarium e esplora il quartiere di Chinatown. Gusta le specialità culinarie locali nei hawker centers e goditi una crociera serale lungo il fiume. Singapore ti offre un mix perfetto di innovazione e tradizione.',
        prezzo: 3000,
        postiDisponibile: 10,
        tipo: 'Moderno',
        numeroStelle: 5,
        immagini: [],
        latitude: 1.3521,
        longitude: 103.8198
      },
      {
        id: 13,
        destinazione: 'Atene, Grecia',
        dataPartenza: '15/01/2025',
        dataRitorno: '25/01/2025',
        descrizione: 'Esplora le antichità greche.',
        prezzo: 1700,
        postiDisponibile: 18,
        tipo: 'Storico',
        numeroStelle: 4,
        immagini: [],
        latitude: 1.3521,
        longitude: 103.8198
      }, {
        id: 14,
        destinazione: 'San Francisco, USA',
        dataPartenza: '20/02/2025',
        dataRitorno: '02/03/2025',
        descrizione: 'Visita la baia di San Francisco.',
        prezzo: 2600,
        postiDisponibile: 12,
        tipo: 'Urbano',
        numeroStelle: 4,
        immagini: [],
        latitude: 1.3521,
        longitude: 103.8198
      }, {
        id: 15,
        destinazione: 'Vienna, Austria',
        dataPartenza: '10/03/2025',
        dataRitorno: '20/03/2025',
        descrizione: 'Scopri la musica e la cultura viennese.',
        prezzo: 2100,
        postiDisponibile: 16,
        tipo: 'Culturale',
        numeroStelle: 5,
        immagini: [],
        latitude: 1.3521,
        longitude: 103.8198
      }, {
        id: 16,
        destinazione: 'Marrakech, Marocco',
        dataPartenza: '05/04/2025',
        dataRitorno: '15/04/2025',
        descrizione: 'Esplora le meraviglie del Marocco.',
        prezzo: 1900,
        postiDisponibile: 14,
        tipo: 'Esotico',
        numeroStelle: 4,
        immagini: [],
        latitude: 1.3521,
        longitude: 103.8198
      }, {
        id: 17,
        destinazione: 'Toronto, Canada',
        dataPartenza: '20/05/2025',
        dataRitorno: '30/05/2025',
        descrizione: 'Visita la città multiculturale.',
        prezzo: 2300,
        postiDisponibile: 13,
        tipo: 'Urbano',
        numeroStelle: 4,
        immagini: [],
        latitude: 1.3521,
        longitude: 103.8198
      }
    ];*/


  constructor(private _http: HttpClient) {
  }

  getTravelsPaginated(offset: number, limit: number) {
    return this._http.get<Travel[]>(`${this.APIUrl}/open/v1/travels-paginated?offset=${offset}&limit=${limit}`).pipe(catchError(this.handleError));
  }

  getTravelsCount() {
    return this._http.get<number>(`${this.APIUrl}/open/v1/travels-count`).pipe(catchError(this.handleError));
  }

  addTravel(travel: Travel, images: File[]) {
    const formData = new FormData();
    formData.append('travel', new Blob([JSON.stringify(travel)], {type: 'application/json'}));
    images.forEach((image) => {
      formData.append(`travelImages`, image);
    });
    return this._http.post(`${this.APIUrl}/admin/v1/create-travel`, formData).pipe(catchError(this.handleError));
  }

  getTravelById(id: number) {
    return this._http.get<Travel>(`${this.APIUrl}/open/v1/travel?id=${id}`).pipe(catchError(this.handleError));
  }

  getTravelImages(id: number) {
    return this._http.get<string[]>(`${this.APIUrl}/open/v1/travel-images?id=${id}`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore, riprovare più tardi';
    switch (error.status) {
      case 400:
        errorMessage = 'Impossibile effettuare la richiesta, riprovare più tardi';
        break;
      case 404:
        errorMessage = 'Viaggio non trovato';
        break;
      case 409:
        errorMessage = 'Errore nella creazione del viaggio';
        break;
      default:
        errorMessage = 'Si è verificato un errore, riprovare più tardi';
    }
    return throwError(() => new Error(errorMessage));
  }
}
