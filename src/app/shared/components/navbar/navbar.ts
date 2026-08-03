import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  userRole = this.authService.userRole;
  currentUser = this.authService.currentUser;

  mobileMenuOpen = signal(false);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  hideNavbar = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/login') || url.startsWith('/register');
  });

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
  }

  get dashboardLink(): string | null {
    switch (this.userRole()) {
      case 'ADMIN': return '/admin/dashboard';
      case 'STADIUM_OWNER': return '/owner/my-stadiums';
      case 'CUSTOMER': return '/customer/my-reservations';
      default: return null;
    }
  }

  get dashboardLabel(): string {
    switch (this.userRole()) {
      case 'ADMIN': return 'لوحة التحكم';
      case 'STADIUM_OWNER': return 'ملاعبي';
      case 'CUSTOMER': return 'حجوزاتي';
      default: return '';
    }
  }
}