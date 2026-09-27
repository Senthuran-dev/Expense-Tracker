import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');

  ngOnInit() {
    // Ping the backend to wake up the Render free tier instance
    const healthUrl = environment.apiUrl.replace('/api/v1', '/health');
    fetch(healthUrl).catch(() => {});
  }
}
