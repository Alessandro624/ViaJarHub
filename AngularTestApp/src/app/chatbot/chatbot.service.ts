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
  private readonly apiVertexAIKey: string = environment.vertexAIAPIKey;
  private readonly apiVertexAIEndpoint: string = environment.vertexAIBaseUrl;
  private readonly apiVertexAIProjectId: string = environment.vertexAIProjectId;
  private readonly apiVertexAILocationId: string = environment.vertexAILocationId;
  private readonly apiVertexAIModelId: string = 'gemini-2.0-flash-exp';
  private readonly apiVertexAIGenerateContent: string = 'streamGenerateContent';
  private readonly apiGoogleAIUrl: string = environment.googleAIURL;
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
  private firstMessageSent: boolean = false;
  private currentMessagesSubject = new BehaviorSubject<Message[]>([]);
  messages$ = this.currentMessagesSubject.asObservable();

  constructor(private http: HttpClient, private travelService: TravelService) {
    this.sendMessage("Ciao").subscribe();
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
    // API key generale utilizzabile all'infinito, poco sicura
    return this.loadTravels().pipe(
      switchMap(() => {
        if (this.firstMessageSent) {
          this.addMessageToChat(message, Sender.USER);
        } else {
          this.firstMessageSent = true;
        }
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        const chatHistory = this.currentMessagesSubject.value
          .filter(({sender}) => sender === Sender.USER)
          .slice(-3)
          .map(({sender, text}) => ({sender, text}));
        const minimalTravels = this.travels.map(({id, destination, startDate, endDate, price}) => ({
          destination,
          startDate,
          endDate,
          price,
          link: `http://localhost:4200/body1/${id}`
        }));
        const body = {
          contents: [
            {role: 'user', parts: [{text: message}]},
          ],
          systemInstruction: {
            parts: [
              {
                text: `Sei un assistente utile che aiuta gli utenti di ViaJarHub a trovare viaggi.
                Invia risposte non troppo lunghe. Non usare html nelle risposte.
                Fornisci i link alle pagine dei viaggi. Non usare il markdown nei link.
                La valuta da utilizzare è l'EURO (€).
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
        return this.http.post(this.apiGoogleAIUrl, body, {headers}).pipe(
          switchMap((res: any) => {
            console.log(res);
            const rawContent = res.candidates[0].content.parts[0].text;
            const formattedContent = this.formatBotResponse(rawContent);
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

  sendMessageVertexAI(message: string): Observable<any> {
    // L'API key ha una durata massima di 1 ora, estendibile a 12 ore, non conviene
    return this.loadTravels().pipe(
      switchMap(() => {
        if (this.firstMessageSent) {
          this.addMessageToChat(message, Sender.USER);
        } else {
          this.firstMessageSent = true;
        }
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiVertexAIKey}`,
        });
        const chatHistory = this.currentMessagesSubject.value
          .filter(({sender}) => sender === Sender.USER)
          .slice(-3)
          .map(({sender, text}) => ({sender, text}));
        const minimalTravels = this.travels.map(({id, destination, startDate, endDate, price}) => ({
          destination,
          startDate,
          endDate,
          price,
          link: `http://localhost:4200/body1/${id}`
        }));
        const body = {
          contents: [
            {role: 'user', parts: [{text: message}]},
          ],
          systemInstruction: {
            parts: [
              {
                text: `Sei un assistente utile che aiuta gli utenti di ViaJarHub a trovare viaggi.
                Invia risposte non troppo lunghe. Non usare html nelle risposte.
                Fornisci i link alle pagine dei viaggi. Non usare il markdown nei link.
                La valuta da utilizzare è l'EURO (€).
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
        const url = `${this.apiVertexAIEndpoint}/v1/projects/${this.apiVertexAIProjectId}/locations/${this.apiVertexAILocationId}/publishers/google/models/${this.apiVertexAIModelId}:${this.apiVertexAIGenerateContent}`;
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
    // PROBLEMA: Limiti per token in invio e risposta troppo bassi
    return this.loadTravels().pipe(
      switchMap(() => {
        if (this.firstMessageSent) {
          this.addMessageToChat(message, Sender.USER);
        } else {
          this.firstMessageSent = true;
        }
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
        const minimalTravels = this.travels.map(({id, destination, startDate, endDate, price}) => ({
          destination,
          startDate,
          endDate,
          price,
          link: `http://localhost:4200/body1/${id}`
        }));
        console.log(chatHistory);
        console.log(minimalTravels);
        const body = {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Sei un assistente utile che aiuta gli utenti di ViaJarHub a trovare viaggi.
                Invia risposte non troppo lunghe. Non usare html nelle risposte.
                Fornisci i link alle pagine dei viaggi. Non usare il markdown nei link.
                La valuta da utilizzare è l'EURO (€).
                Cronologia della chat: ${JSON.stringify(chatHistory)}
                Dati dei viaggi: ${JSON.stringify(minimalTravels)}`
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
    // 2. Rimuovi spazi multipli
    formattedContent = formattedContent.replace(/\s{2,}/g, ' ');
    // 3. Rimuovi tripli backtick per il codice
    formattedContent = formattedContent.replace(/```/g, '');
    // 4. Aggiungi formattazione Markdown a HTML
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
    // 5. Trasforma i link
    formattedContent = formattedContent.replace(/(https?:\/\/\S+)/g, (match) => {
      return `<a href="${match}" target="_blank" class="link-light link-offset-2 link-underline-opacity-50 link-underline-opacity-100-hover">Clicca qui</a><br>`;
    });
    // 6. Aggiungi ritorni a capo dopo punti, punti esclamativi o interrogativi
    formattedContent = formattedContent.replace(/([.!?])(\s|$)/g, '$1<br>');
    // 7. Sanifica liste consecutive
    formattedContent = formattedContent.replace(/(<\/li>\s*)+<ul>/g, '</li><ul>');
    formattedContent = formattedContent.replace(/(<\/li>\s*)+<ol>/g, '</li><ol>');
    // 8. Aggiungi ritorni a capo dopo \n
    formattedContent = formattedContent.replace(/\n+/g, '<br>');
    return formattedContent;
  }

  private addMessageToChat(message: string, sender: Sender) {
    const updatedMessages = [...this.currentMessagesSubject.value, {text: message, sender}];
    this.currentMessagesSubject.next(updatedMessages);
  }
}
