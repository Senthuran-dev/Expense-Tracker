import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: []
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  public authService = inject(AuthService);

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }
}
