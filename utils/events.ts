import type { Hat } from '@/types';

// Simple event emitter for React Native
class SimpleEventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  removeListener(event: string, listener: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, data?: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => listener(data));
  }
}

export const eventEmitter = new SimpleEventEmitter();

export const HatEvents = {
  HAT_ADDED: 'hat_added',
  HAT_UPDATED: 'hat_updated',
} as const;

export interface HatAddedEvent {
  hat: Hat;
}

export interface HatUpdatedEvent {
  hat: Hat;
}
