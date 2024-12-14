import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor() {
  }
}
