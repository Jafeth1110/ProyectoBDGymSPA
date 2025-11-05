import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isAdmin = false;
  isClient = false;
  isTrainer = false;

  constructor(private auth: AuthService) {
    const role = this.auth.getCurrentUserRole();
    this.isAdmin = role === 'admin';
    this.isClient = role === 'cliente';
    this.isTrainer = role === 'entrenador';
  }
}
