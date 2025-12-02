import { Component, Input, Output, EventEmitter, signal, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: string | number | null;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDropdownComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <!-- Backdrop -->
      <div *ngIf="isOpen()" 
           class="fixed inset-0 z-40" 
           (click)="close()"></div>
      
      <!-- Label -->
      <label *ngIf="label" 
             [for]="id" 
             class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>
      
      <!-- Dropdown Button -->
      <button type="button"
              [id]="id"
              [disabled]="disabled"
              (click)="toggle()"
              [class.opacity-50]="disabled"
              [class.cursor-not-allowed]="disabled"
              class="relative w-full pl-10 pr-10 py-3 rounded-lg border-2 transition-all sm:text-sm text-left"
              [class.border-primary-200]="!disabled && !hasError"
              [class.border-red-300]="hasError"
              [class.bg-white]="!disabled"
              [class.bg-gray-100]="disabled"
              [class.focus:border-primary-500]="!disabled && !hasError"
              [class.focus:ring-2]="!disabled"
              [class.focus:ring-primary-500]="!disabled && !hasError"
              [class.focus:ring-offset-0]="!disabled"
              [class.shadow-sm]="!isOpen()"
              [class.shadow-md]="isOpen()">
        <!-- Left Icon -->
        <div *ngIf="leftIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ng-container [ngSwitch]="leftIcon">
            <svg *ngSwitchCase="'tag'" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <svg *ngSwitchCase="'filter'" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <svg *ngSwitchDefault class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </ng-container>
        </div>
        
        <!-- Selected Value -->
        <span class="block truncate text-gray-900">
          {{ getSelectedLabel() }}
        </span>
        
        <!-- Chevron Icon -->
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-gray-400 transition-transform duration-200" 
               [class.rotate-180]="isOpen()"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <!-- Dropdown Menu -->
      <div *ngIf="isOpen()"
           class="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-200 ease-out origin-top">
        <div class="max-h-60 overflow-auto py-1">
          <button *ngFor="let option of options"
                  type="button"
                  [disabled]="option.disabled"
                  (click)="selectOption(option)"
                  [class.opacity-50]="option.disabled"
                  [class.cursor-not-allowed]="option.disabled"
                  class="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-primary-50 hover:text-primary-700 transition-colors flex items-center"
                  [class.bg-primary-50]="isSelected(option)"
                  [class.text-primary-700]="isSelected(option)"
                  [class.font-medium]="isSelected(option)">
            <svg *ngIf="isSelected(option)" 
                 class="h-5 w-5 mr-2 text-primary-600 flex-shrink-0" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span [class.ml-7]="!isSelected(option)">{{ option.label }}</span>
          </button>
          <div *ngIf="options.length === 0" class="px-4 py-3 text-sm text-gray-500 text-center">
            Seçenek bulunamadı
          </div>
        </div>
      </div>
      
      <!-- Error Message -->
      <div *ngIf="hasError && errorMessage" class="mt-1 text-sm text-red-600">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: []
})
export class CustomDropdownComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() id: string = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder: string = 'Seçiniz';
  @Input() options: DropdownOption[] = [];
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() errorMessage?: string;
  @Input() leftIcon?: 'tag' | 'filter' | 'none';
  @Output() valueChange = new EventEmitter<string | number | null>();

  isOpen = signal(false);
  value: string | number | null = null;
  
  private onChange = (value: string | number | null) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    if (!this.leftIcon) {
      this.leftIcon = 'tag';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      // Options changed, close dropdown if open
      if (this.isOpen()) {
        this.close();
      }
    }
  }

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  toggle(): void {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
    }
  }

  close(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) return;
    
    this.value = option.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.close();
  }

  isSelected(option: DropdownOption): boolean {
    if (this.value === null && option.value === null) return true;
    return this.value === option.value;
  }

  getSelectedLabel(): string {
    if (this.value === null) {
      return this.placeholder;
    }
    const selected = this.options.find(opt => opt.value === this.value);
    return selected?.label || this.placeholder;
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

