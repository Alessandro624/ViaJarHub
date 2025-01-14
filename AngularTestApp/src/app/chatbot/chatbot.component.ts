import {Component, ElementRef, Inject, NgZone, OnInit, ViewChild} from '@angular/core';
import {ChatbotService} from './chatbot.service';
import {Message} from '../models/chatbot/message.model';
import {Sender} from '../models/chatbot/sender.enum';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit {
  protected readonly Sender = Sender;
  messages: Message[] = [];
  newMessage: string = "";
  isBotResponding: boolean = false;
  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  constructor(private _chatbotService: ChatbotService, @Inject(NgZone) private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this._chatbotService.messages$.subscribe((data) => {
      this.messages = data;
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      let message = this.newMessage;
      this.newMessage = "";
      this.isBotResponding = true;
      this.scrollToBottom();
      this.focusInput();
      this._chatbotService.sendMessage(message).subscribe(() => {
        this.scrollToBottom();
        this.focusInput();
        this.isBotResponding = false;
      });
    }
  }

  scrollToBottom() {
    this.ngZone.runOutsideAngular(() => setTimeout(() => {
      if (this.chatBody) {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      }
    }, 0));
  }

  focusInput() {
    this.ngZone.runOutsideAngular(() => setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 0));
  }
}
