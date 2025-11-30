import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="message" 
         class="bg-gradient-to-r from-danger-50 to-rose-50 border-2 border-danger-300 text-danger-700 px-4 py-3 rounded-xl relative animate-slide-down shadow-lg backdrop-blur-sm" 
         role="alert"
         style="background: linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 228, 230, 0.95) 100%); border-image: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%) 1;">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-danger-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="block sm:inline flex-1 font-medium">{{ message }}</span>
      </div>
    </div>
  `,
  styles: []
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}

