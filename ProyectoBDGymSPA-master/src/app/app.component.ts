// src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gym-spa';
  public identity: any;

  constructor() {
    this.loadIdentity();
  }

  loadIdentity() {
    const identity = sessionStorage.getItem('identity');
    if (identity) {
      try {
        this.identity = JSON.parse(identity);
      } catch (error) {
        console.error("JSON inválido en 'identity':", error);
        this.identity = null;
      }
    }
  }

  logout() {
    sessionStorage.removeItem('identity');
    sessionStorage.removeItem('token');
    this.identity = null;
  }
}
