import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /**
   * Extracts error message from HTTP error response
   * Handles different error response formats
   */
  extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      // Try different error message paths
      if (error.error?.error?.message) {
        return error.error.error.message;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      if (typeof error.error === 'string') {
        return error.error;
      }
      
      // Fallback to status text or default message
      if (error.status === 0) {
        return 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
      }
      if (error.status === 401) {
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      }
      if (error.status === 403) {
        return 'Bu işlem için yetkiniz bulunmamaktadır.';
      }
      if (error.status === 404) {
        return 'İstenen kaynak bulunamadı.';
      }
      if (error.status === 500) {
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      }
      
      return error.statusText || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
    
    if (error instanceof Error) {
      return error.message || 'Beklenmeyen bir hata oluştu.';
    }
    
    return 'Bilinmeyen bir hata oluştu.';
  }

  /**
   * Gets a user-friendly error message for common error scenarios
   */
  getDefaultErrorMessage(context?: string): string {
    const contextMessages: Record<string, string> = {
      login: 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.',
      register: 'Kayıt başarısız. Lütfen tekrar deneyin.',
      load: 'Veriler yüklenirken bir hata oluştu.',
      save: 'Kayıt başarısız. Lütfen tekrar deneyin.',
      delete: 'Silme işlemi başarısız. Lütfen tekrar deneyin.',
      update: 'Güncelleme başarısız. Lütfen tekrar deneyin.'
    };
    
    return context && contextMessages[context] 
      ? contextMessages[context] 
      : 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
}

