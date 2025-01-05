import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of, switchMap, tap} from 'rxjs';
import {TravelService} from '../travel-detail/travel.service';
import {TravelFilter} from '../models/travel/travel-filter.model';
import {Travel} from '../models/travel/travel.model';
import {Message} from '../models/chatbot/message.model';
import {Sender} from '../models/chatbot/sender.enum';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly apiUrl = environment.openAIBaseUrl;
  private readonly apiKey = environment.openAIAPIKey;
  private readonly apiOrganization = environment.openAIOrganization;
  private readonly apiProjectId = environment.openAIProjectId;
  private travels: Travel[] = [];
  private readonly filters: TravelFilter = {
    searchQuery: '',
    startDate: '',
    endDate: '',
    minPrice: 0,
    maxPrice: 0,
    travelType: null,
    travelOrder: null,
    reverse: false,
  };
  private currentMessagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.currentMessagesSubject.asObservable();

  constructor(private http: HttpClient, private travelService: TravelService) {
  }

  private loadTravels(): Observable<Travel[]> {
    if (this.travels.length > 0) {
      return new Observable((observer) => observer.next(this.travels));
    }
    return this.travelService.getTravelsPaginated(0, 100, this.filters).pipe(
      tap((value) => (this.travels = value))
    );
  }

  sendMessage(message: string): Observable<any> {
    return this.loadTravels().pipe(
      tap((travels) => console.log(travels)),
      switchMap(() => {
        this.addMessageToChat(message, Sender.USER);
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'OpenAI-Organization': this.apiOrganization,
          'OpenAI-Project': this.apiProjectId,
        });
        const body = {
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: `Sei un assistente utile che fornisce aiuto agli utenti di ViaJarHub, una piattaforma per trovare il viaggio più adatto alle proprie esigenze.
            Nascondi informazioni sensibili dei viaggi.
            Ecco la cronologia della chat: ${JSON.stringify(this.currentMessagesSubject.value)}
            Ecco i dati sui viaggi attuali: ${JSON.stringify(this.travels)}`,
          },
            {role: 'user', content: message},
          ],
        };
        return this.http.post(this.apiUrl, body, {headers}).pipe(
          switchMap((res: any) => {
            const rawContent = res.choices[0].message.content;
            const formattedContent = this.formatBotResponse(rawContent);
            this.addMessageToChat(formattedContent, Sender.CHATBOT);
            return of(this.currentMessagesSubject.value);
          }),
          catchError((err) => {
            this.addMessageToChat("Errore durante la richiesta", Sender.CHATBOT);
            console.error('Errore durante la richiesta:', err);
            return of(this.currentMessagesSubject.value);
          })
        )
      })
    );
  }

  private formatBotResponse(content: string): string {
    // 1. Rimuovi spazi in eccesso all'inizio e alla fine
    let formattedContent = content.trim();
    // 2. Rimuovi immagini
    formattedContent = formattedContent.replace(/!\[([^\]]*)]\([^)]+\)/g, ''); // Rimuovi immagini in markdown
    // 3. Gestisci eventuali simboli o markup non desiderati
    formattedContent = formattedContent.replace(/\s{2,}/g, ' '); // Rimuovi spazi multipli
    formattedContent = formattedContent.replace(/`{3}/g, ''); // Rimuovi tripli backtick se presenti
    // 4. Aggiungi Markdown o evidenziazione
    formattedContent = formattedContent.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>'); // grassetto
    formattedContent = formattedContent.replace(/([*_])(.*?)\1/g, '<em>$1</em>'); // corsivo
    formattedContent = formattedContent.replace(/^([*\-+])\s+(.*)$/gm, '<ul><li>$2</li></ul>'); // elenchi puntati
    formattedContent = formattedContent.replace(/<\/ul>\s*<ul>/g, ''); // <ul> nidificati
    formattedContent = formattedContent.replace(/^(\d+\.)\s+(.*)$/gm, '<ol><li>$2</li></ol>'); // elenchi numerati
    formattedContent = formattedContent.replace(/<\/ol>\s*<ol>/g, ''); // <ol> nidificati
    formattedContent = formattedContent.replace(/^(#{1,6})\s+(.*)$/gm, (match, p1, p2) => {
      const level = p1.length; // Determina il livello del titolo
      return `<h${level}>${p2}</h${level}>`; // grandezza dei titoli
    });
    formattedContent = formattedContent.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>'); // grassetto e corsivo
    formattedContent = formattedContent.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>'); // Citazioni
    // 5. Aggiungi ritorni a capo per separare sezioni troppo lunghe
    formattedContent = formattedContent.replace(/([.!?])(\s|$)/g, '$1<br>');
    return formattedContent;
  }

  private addMessageToChat(message: string, sender: Sender) {
    this.currentMessagesSubject.value.push({text: message, sender: sender});
  }
}
