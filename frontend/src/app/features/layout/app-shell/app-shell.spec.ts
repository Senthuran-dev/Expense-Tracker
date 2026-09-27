import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppShell } from './app-shell';

// Mock localStorage
const mockLocalStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('AppShell', () => {
  let component: AppShell;
  let fixture: ComponentFixture<AppShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
