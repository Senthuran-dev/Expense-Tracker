import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: []
})
export class Navbar implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  public authService = inject(AuthService);
  private router = inject(Router);

  pageTitle = 'Dashboard';
  currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  ngOnInit() {
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
    });
  }

  private updateTitle(url: string) {
    if (url.includes('/expenses')) {
      this.pageTitle = 'Expenses';
    } else if (url.includes('/analytics')) {
      this.pageTitle = 'Analytics';
    } else if (url.includes('/budgets')) {
      this.pageTitle = 'Budgets';
    } else if (url.includes('/categories')) {
      this.pageTitle = 'Categories';
    } else if (url.includes('/settings')) {
      this.pageTitle = 'Settings';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
