import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private SESSION_KEY = 'session_active';

  initSession(): void {
    localStorage.setItem(this.SESSION_KEY, 'true');
  }

  endSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('identity');
    localStorage.removeItem('token_expiration');
  }

  isSessionActive(): boolean {
    return localStorage.getItem(this.SESSION_KEY) === 'true';
  }

  cleanStaleSession(): void {
    if (this.isSessionActive() && !localStorage.getItem('token')) {
      this.endSession();
    }
  }
}