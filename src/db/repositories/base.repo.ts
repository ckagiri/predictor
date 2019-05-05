import { Observable, Subscriber } from "rxjs";

import { DocumentDao } from "./document.dao";
import { IEntity, IDocumentEntity } from "../models/base.model";

export interface IBaseRepository<T extends IEntity> {
  save$(obj: IEntity): Observable<T>;
  insert$(obj: IEntity): Observable<T>;
  saveMany$(objs: IEntity[]): Observable<T[]>;
  insertMany$(objs: IEntity[]): Observable<T[]>;
  findByIdAndUpdate$(id: string, update: any): Observable<T>;
  findOneAndUpdate$(conditions: any, update: any, options?: any): Observable<T>;
  findAll$(conditions?: any, projection?: any, options?: any): Observable<T[]>;
  findOne$(conditions: any, projection?: any): Observable<T>;
  findById$(id: string): Observable<T>;
  remove$(id: string): Observable<void>;
  count$(conditions: any): Observable<number>;
}

export class BaseRepository<
  T extends IEntity,
  TDocument extends T & IDocumentEntity
> extends DocumentDao<TDocument> implements IBaseRepository<T> {
  save$(obj: IEntity): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.save(obj).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  saveMany$(objs: IEntity[]): Observable<T[]> {
    return Observable.create((observer: Subscriber<T[]>) => {
      this.saveMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  insert$(obj: IEntity): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.insert(obj).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  insertMany$(objs: IEntity[]): Observable<T[]> {
    return Observable.create((observer: Subscriber<T[]>) => {
      this.insertMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  findByIdAndUpdate$(id: string, update: any): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findByIdAndUpdate(id, update).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  findOneAndUpdate$(
    conditions: any,
    update: any,
    options?: any
  ): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findOneAndUpdate(conditions, update, options).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  findAll$(conditions?: any, projection?: any, options?: any): Observable<T[]> {
    return Observable.create((observer: Subscriber<T[]>) => {
      this.findAll(conditions, projection, options).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  findOne$(conditions: any, projection?: any): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findOne(conditions).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  findById$(id: string): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      this.findById(id).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  remove$(id: string): Observable<void> {
    return Observable.create((observer: Subscriber<void>) => {
      this.remove(id).then(
        () => {
          observer.next();
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }

  count$(conditions: any): Observable<number> {
    return Observable.create((observer: Subscriber<number>) => {
      this.count(conditions).then(
        (result: number) => {
          observer.next(result);
          observer.complete();
        },
        (error: any) => {
          observer.error(error);
        }
      );
    });
  }
}
