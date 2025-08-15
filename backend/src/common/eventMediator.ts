import { EventEmitter } from 'events';

export interface EventMediator {
  addListener(event: string, listener: any): EventMediator;
  eventNames(): (string | symbol)[];
  publish(event: string, ...args: any[]): boolean;
  removeAllListeners(event?: string): EventMediator;
  removeListener(event: string, listener: any): EventMediator;
}

export class EventMediatorImpl implements EventMediator {
  private static classInstance: EventMediatorImpl | null = null;
  emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  static getInstance(): EventMediator {
    EventMediatorImpl.classInstance ??= new EventMediatorImpl();
    return EventMediatorImpl.classInstance;
  }

  addListener(event: string, listener: any) {
    this.emitter.addListener(event, listener);
    return this;
  }

  eventNames() {
    return this.emitter.eventNames();
  }

  publish(event: string, ...args: any[]) {
    return this.emitter.emit(event, ...args);
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
    return this;
  }

  removeListener(event: string, listener: any) {
    this.emitter.removeListener(event, listener);
    return this;
  }
}
