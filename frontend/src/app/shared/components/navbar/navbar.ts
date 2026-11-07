import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { DateFilterService } from '../../../core/services/date-filter.service';

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
  public dateFilterService = inject(DateFilterService);
  private router = inject(Router);

  pageTitle = 'Dashboard';
  isDropdownOpen = false;
  tempYear = this.dateFilterService.currentYear;
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit() {
    this.updateTitle(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects || event.url);
    });

    this.dateFilterService.selectedDate$.subscribe(d => {
      this.tempYear = d.year;
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.tempYear = this.dateFilterService.currentYear;
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  prevMonth() {
    this.dateFilterService.prevMonth();
  }

  nextMonth() {
    this.dateFilterService.nextMonth();
  }

  selectMonth(monthIndex: number) {
    this.dateFilterService.setDate(monthIndex + 1, this.tempYear);
    this.closeDropdown();
  }

  prevYear() {
    this.tempYear--;
  }

  nextYear() {
    this.tempYear++;
  }

  selectCurrentMonth() {
    this.dateFilterService.resetToCurrent();
    this.closeDropdown();
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
