import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: []
})
export class Sidebar {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  
  public authService = inject(AuthService);

  onClose() {
    this.close.emit();
  }
}
