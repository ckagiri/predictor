export interface IEventEmitter {
  addListener(event: string, listener: any): IEventEmitter;
  on(event: string, listener: () => void): IEventEmitter;
  once(event: string, listener: any): IEventEmitter;
  removeListener(event: string, listener: any): IEventEmitter;
  removeAllListeners(event?: string): IEventEmitter;
  setMaxListeners(n: number): void;
  listeners(event: string): any[];
  emit(event: string, ...args: any[]): boolean;
}
