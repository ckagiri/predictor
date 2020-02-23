export interface EventEmitter {
  addListener(event: string, listener: any): EventEmitter;
  on(event: string, listener: () => void): EventEmitter;
  once(event: string, listener: any): EventEmitter;
  removeListener(event: string, listener: any): EventEmitter;
  removeAllListeners(event?: string): EventEmitter;
  setMaxListeners(n: number): void;
  listeners(event: string): any[];
  emit(event: string, ...args: any[]): boolean;
}
