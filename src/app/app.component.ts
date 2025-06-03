import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gym-spa';
  public identity: any;

  constructor(private router: Router) {
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
    this.router.navigate(['']);
  }
}
