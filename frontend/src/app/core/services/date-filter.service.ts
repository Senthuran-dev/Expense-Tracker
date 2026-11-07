import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SelectedDate {
  month: number; // 1 - 12
  year: number;  // e.g. 2026
}

@Injectable({
  providedIn: 'root'
})
export class DateFilterService {
  private now = new Date();
  private selectedDateSubject = new BehaviorSubject<SelectedDate>({
    month: this.now.getMonth() + 1,
    year: this.now.getFullYear()
  });

  public selectedDate$: Observable<SelectedDate> = this.selectedDateSubject.asObservable();

  get currentMonth(): number {
    return this.selectedDateSubject.value.month;
  }

  get currentYear(): number {
    return this.selectedDateSubject.value.year;
  }

  get formattedMonthYear(): string {
    const date = new Date(this.currentYear, this.currentMonth - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  }

  get monthName(): string {
    const date = new Date(this.currentYear, this.currentMonth - 1, 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
  }

  setDate(month: number, year: number): void {
    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
      this.selectedDateSubject.next({ month, year });
    }
  }

  setMonth(month: number): void {
    this.setDate(month, this.currentYear);
  }

  setYear(year: number): void {
    this.setDate(this.currentMonth, year);
  }

  prevMonth(): void {
    let m = this.currentMonth - 1;
    let y = this.currentYear;
    if (m < 1) {
      m = 12;
      y--;
    }
    this.setDate(m, y);
  }

  nextMonth(): void {
    let m = this.currentMonth + 1;
    let y = this.currentYear;
    if (m > 12) {
      m = 1;
      y++;
    }
    this.setDate(m, y);
  }

  resetToCurrent(): void {
    const now = new Date();
    this.setDate(now.getMonth() + 1, now.getFullYear());
  }

  getStartDateString(month: number = this.currentMonth, year: number = this.currentYear): string {
    const mStr = String(month).padStart(2, '0');
    return `${year}-${mStr}-01`;
  }

  getEndDateString(month: number = this.currentMonth, year: number = this.currentYear): string {
    const daysInMonth = new Date(year, month, 0).getDate();
    const mStr = String(month).padStart(2, '0');
    return `${year}-${mStr}-${daysInMonth}`;
  }
}
