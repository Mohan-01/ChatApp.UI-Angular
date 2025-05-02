import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('Local storage is not available or accessible.', error);
      return false;
    }
  }

  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      console.error(`Failed to set item in local storage: ${key}`);
    }
  }

  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    } else {
      console.error(`Failed to get item from local storage: ${key}`);
      return null;
    }
  }

  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    } else {
      console.error(`Failed to remove item from local storage: ${key}`);
    }
  }

  clear(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    } else {
      console.error('Failed to clear local storage.');
    }
  }

  // Utility methods

  getUsername(): string | null {
    return this.getItem('username');
  }

  setUsername(username: string) {
    this.setItem('username', username);
  }

  removeUsername(): void {
    this.removeItem('username');
  }
}
