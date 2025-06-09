import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  identity: any = null;
  isMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
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
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
