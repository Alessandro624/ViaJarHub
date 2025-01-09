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
  private readonly apiOpenAIUrl = environment.openAIBaseUrl;
  private readonly apiOpenAIKey = environment.openAIAPIKey;
  private readonly apiOpenAIOrganization = environment.openAIOrganization;
  private readonly apiOpenAIProjectId = environment.openAIProjectId;
  private apiGoogleAIKey: string = environment.googleAIAPIKey;
  private apiGoogleAIEndpoint: string = environment.googleAIBaseUrl;
  private apiGoogleAIProjectId: string = environment.googleAIProjectId;
  private apiGoogleAILocationId: string = environment.googleAILocationId;
  private apiGoogleAIModelId: string = 'gemini-2.0-flash-exp';
  private apiGoogleAIGenerateContent: string = 'streamGenerateContent';
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
      switchMap(() => {
        this.addMessageToChat(message, Sender.USER);
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiGoogleAIKey}`,
        });
        const chatHistory = this.currentMessagesSubject.value
          .filter(({sender}) => sender === Sender.USER)
          .slice(-3)
          .map(({sender, text}) => ({sender, text}));
        const minimalTravels = this.travels.map(({destination, startDate, endDate, price}) => ({
          destination,
          startDate,
          endDate,
          price,
        }));
        const body = {
          contents: [
            {role: 'user', parts: [{text: message}]},
          ],
          systemInstruction: {
            parts: [
              {
                text: `Sei un assistente utile che aiuta gli utenti di ViaJarHub a trovare viaggi. Invia risposte non troppo lunghe.
              Cronologia della chat: ${JSON.stringify(chatHistory)}
              Dati dei viaggi: ${JSON.stringify(minimalTravels)}`
              },
            ],
          },
          generationConfig: {
            responseModalities: ['TEXT'],
            temperature: 1,
            maxOutputTokens: 8192,
            topP: 0.95,
          },
          safetySettings: [
            {category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF'},
            {category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF'},
            {category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF'},
            {category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF'},
          ],
        };
        const url = `${this.apiGoogleAIEndpoint}/v1/projects/${this.apiGoogleAIProjectId}/locations/${this.apiGoogleAILocationId}/publishers/google/models/${this.apiGoogleAIModelId}:${this.apiGoogleAIGenerateContent}`;
        return this.http.post(url, body, {headers}).pipe(
          switchMap((res: any) => {
            const fullResponse = res.map((item: { candidates: { content: { parts: any[]; }; }[]; }) =>
              item.candidates[0]?.content?.parts.map(part => part.text).join('')
            ).join('') || 'Risposta non disponibile';
            const formattedContent = this.formatBotResponse(fullResponse);
            this.addMessageToChat(formattedContent, Sender.CHATBOT);
            return of(this.currentMessagesSubject.value);
          }),
          catchError((err) => {
            this.addMessageToChat('Errore durante la richiesta', Sender.CHATBOT);
            console.error('Errore durante la richiesta:', err);
            return of(this.currentMessagesSubject.value);
          })
        );
      })
    );
  }

  sendMessageOpenAI(message: string): Observable<any> {
    return this.loadTravels().pipe(
      switchMap(() => {
        this.addMessageToChat(message, Sender.USER);
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiOpenAIKey}`,
          'OpenAI-Organization': this.apiOpenAIOrganization,
          'OpenAI-Project': this.apiOpenAIProjectId,
        });
        const chatHistory = this.currentMessagesSubject.value
          .filter(({sender}) => sender === Sender.USER)
          .slice(-3)
          .map(({sender, text}) => ({sender, text}));
        const minimalTravels = this.travels.map(({destination, startDate, endDate, price}) => ({
          destination,
          startDate,
          endDate,
          price
        }));
        console.log(chatHistory);
        console.log(minimalTravels);
        const body = {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sei un assistente utile che aiuta gli utenti di ViaJarHub a trovare viaggi.
            Ecco la cronologia della chat: ${JSON.stringify(chatHistory)}
            Ecco i dati dei viaggi attuali: ${JSON.stringify(minimalTravels)}`,
            },
            {role: 'user', content: message},
          ]
        };
        return this.http.post(this.apiOpenAIUrl, body, {headers}).pipe(
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
        );
      })
    );
  }

  private formatBotResponse(content: string): string {
    // 1. Rimuovi spazi in eccesso all'inizio e alla fine
    let formattedContent = content.trim();
    // 2. Rimuovi immagini in Markdown
    formattedContent = formattedContent.replace(/!\[[^\]]*]\([^)]*\)/g, '');
    // 3. Rimuovi spazi multipli
    formattedContent = formattedContent.replace(/\s{2,}/g, ' ');
    // 4. Rimuovi tripli backtick per il codice
    formattedContent = formattedContent.replace(/```/g, '');
    // 5. Aggiungi formattazione Markdown a HTML
    // Grassetto e corsivo insieme
    formattedContent = formattedContent.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Grassetto
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Corsivo
    formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Elenchi puntati
    formattedContent = formattedContent.replace(/^([*\-+])\s+(.*)$/gm, '<ul><li>$2</li></ul>');
    formattedContent = formattedContent.replace(/(<\/ul>\s*)+<ul>/g, ''); // Rimuovi <ul> nidificati consecutivi
    // Elenchi numerati
    formattedContent = formattedContent.replace(/^(\d+)\.\s+(.*)$/gm, '<ol><li>$2</li></ol>');
    formattedContent = formattedContent.replace(/(<\/ol>\s*)+<ol>/g, ''); // Rimuovi <ol> nidificati consecutivi
    // Titoli
    formattedContent = formattedContent.replace(/^(#{1,6})\s+(.*)$/gm, (_match, p1, p2) => {
      const level = p1.length;
      return `<h${level}>${p2}</h${level}>`;
    });
    // Citazioni
    formattedContent = formattedContent.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>');
    // 6. Aggiungi ritorni a capo dopo punti, punti esclamativi o interrogativi
    formattedContent = formattedContent.replace(/([.!?])(\s|$)/g, '$1<br>');
    // 7. Sanifica liste consecutive
    formattedContent = formattedContent.replace(/(<\/li>\s*)+<ul>/g, '</li><ul>');
    formattedContent = formattedContent.replace(/(<\/li>\s*)+<ol>/g, '</li><ol>');
    return formattedContent;
  }

  private addMessageToChat(message: string, sender: Sender) {
    const updatedMessages = [...this.currentMessagesSubject.value, {text: message, sender}];
    this.currentMessagesSubject.next(updatedMessages);
  }
}
