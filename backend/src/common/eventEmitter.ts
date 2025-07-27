export interface EventEmitter {
  addListener(event: string, listener: any): EventEmitter;
  emit(event: string, ...args: any[]): boolean;
  listeners(event: string): any[];
  on(event: string, listener: () => void): EventEmitter;
  once(event: string, listener: any): EventEmitter;
  removeAllListeners(event?: string): EventEmitter;
  removeListener(event: string, listener: any): EventEmitter;
  setMaxListeners(n: number): void;
}
