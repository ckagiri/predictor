import { EventEmitter } from 'events';

export interface EventMediator {
  eventNames(): Array<string | symbol>;
  publish(event: string, ...args: any[]): boolean;
  addListener(event: string, listener: any): EventMediator;
  removeListener(event: string, listener: any): EventMediator;
  removeAllListeners(event?: string): EventMediator;
}

export class EventMediatorImpl implements EventMediator {
  public static getInstance() {
    if (EventMediatorImpl.classInstance == null) {
      EventMediatorImpl.classInstance = new EventMediatorImpl();
    }
    return EventMediatorImpl.classInstance;
  }
  private static classInstance: EventMediatorImpl;

  public emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public eventNames() {
    return this.emitter.eventNames();
  }

  public publish(event: string, ...args: any[]) {
    return this.emitter.emit(event, ...args);
  }

  public addListener(event: string, listener: any) {
    this.emitter.addListener(event, listener);
    return this;
  }

  public removeListener(event: string, listener: any) {
    this.emitter.removeListener(event, listener);
    return this;
  }

  public removeAllListeners(event?: string) {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
    return this;
  }
}
