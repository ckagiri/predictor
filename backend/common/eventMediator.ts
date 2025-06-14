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
  public emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public static getInstance() {
    EventMediatorImpl.classInstance ??= new EventMediatorImpl();
    return EventMediatorImpl.classInstance;
  }

  public addListener(event: string, listener: any) {
    this.emitter.addListener(event, listener);
    return this;
  }

  public eventNames() {
    return this.emitter.eventNames();
  }

  public publish(event: string, ...args: any[]) {
    return this.emitter.emit(event, ...args);
  }

  public removeAllListeners(event?: string) {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
    return this;
  }

  public removeListener(event: string, listener: any) {
    this.emitter.removeListener(event, listener);
    return this;
  }
}
