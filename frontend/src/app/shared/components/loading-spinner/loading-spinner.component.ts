import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center p-8">
      <div class="relative">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary-500 border-r-primary-600 border-b-primary-700 border-l-primary-500 animate-pulse-glow"></div>
        <div class="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-secondary-400 border-r-transparent border-b-transparent border-l-transparent opacity-50" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {}

