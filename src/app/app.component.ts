import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'gym-spa';
  public identity: any = null;
  public isMenuOpen = false;
  private identitySubscription!: Subscription;
  private routerSubscription!: Subscription;
  private inactivityTimer: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // No verificar nueva sesión aquí, dejamos que persista
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    // No limpiar la sesión al refrescar la página
    // Solo marcar que la ventana se está cerrando
  }

  @HostListener('window:mousemove')
  @HostListener('window:keypress')
  resetInactivityTimer(): void {
    this.setupInactivityTimer();
  }

  ngOnInit(): void {
    this.setupSessionManagement();
    this.setupInactivityTimer();
  }

  private setupSessionManagement(): void {
    // No forzar que la sesión sea activa aquí
    // Dejar que persista si existe una válida

    // Suscripción a cambios en la identidad
    this.identitySubscription = this.authService.currentIdentity.subscribe(
      identity => {
        this.identity = identity;
        console.log('Identity updated:', identity);
        const publicRoutes = ['/login', '/signup'];
        const currentRoute = this.router.url.split('?')[0].split('#')[0];

        if (!identity && !publicRoutes.includes(currentRoute)) {
          this.router.navigate(['/login']);
        }
      }
    );

    // Verificar identidad al cambiar de ruta
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.authService.refreshIdentity();
        this.checkSessionValidity();
      }
    });

    // Carga inicial
    this.authService.refreshIdentity();
  }

  private setupInactivityTimer(): void {
    clearTimeout(this.inactivityTimer);
    // 30 minutos de inactividad (1800000 ms)
    this.inactivityTimer = setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.authService.logout().pipe(take(1)).subscribe(() => {
          this.router.navigate(['/login'], { queryParams: { sessionTimeout: true } });
        });
      }
    }, 1800000);
  }

  private checkSessionValidity(): void {
    const isAuth = this.authService.isAuthenticated();
    const allowedRoutes = ['/login', '/signup'];
    const currentRoute = this.router.url.toLowerCase().split('?')[0].split('#')[0];

    const isAllowed = allowedRoutes.some(route => currentRoute.startsWith(route));
    console.log('checkSessionValidity', { isAuth, currentRoute });

    if (!isAuth && !isAllowed) {
      this.router.navigate(['/login'], { queryParams: { sessionExpired: true } });
    }

    if (isAuth && isAllowed) {
      this.router.navigate(['/home']); // Cambiar a home en lugar de inicio
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.inactivityTimer);
    this.identitySubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout().pipe(take(1)).subscribe(() => {
      this.closeMenu();
      this.router.navigate(['/login']);
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}