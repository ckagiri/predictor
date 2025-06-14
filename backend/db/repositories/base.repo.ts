import { Model } from 'mongoose';
import { from, Observable, Subscriber } from 'rxjs';

import { Entity } from '../models/base.model.js';
import { DocumentDao } from './document.dao.js';

export interface BaseRepository<T extends Entity> {
  count$(conditions: any): Observable<number>;
  distinct$(field: string, conditions?: any): Observable<string[]>;
  find$(
    query?: any,
    projection?: any,
    options?: any
  ): Observable<{ count: number; result: T[] }>;
  findAll$(conditions?: any, projection?: any, options?: any): Observable<T[]>;
  findAllByIds$(ids?: string[]): Observable<T[]>;
  findById$(id: string): Observable<T | null>;
  findByIdAndUpdate$(id: string, update: any): Observable<T>;
  findOne$(conditions: any, projection?: any): Observable<T | null>;
  findOneAndUpdate$(conditions: any, update: any, options?: any): Observable<T>;
  findOneAndUpsert$(conditions: any, update: any, options?: any): Observable<T>;
  findOneOrCreate$(conditions: any, mergeContents: any): Observable<T>;
  insert$(obj: Entity): Observable<T>;
  insertMany$(objs: Entity[]): Observable<T[]>;
  remove$(id: string): Observable<void>;
  save$(obj: Entity): Observable<T>;
  saveMany$(objs: Entity[]): Observable<T[]>;
  updateMany$(objs: Entity[]): Observable<any>;
  upsertMany$(objs: Entity[]): Observable<any>;
}

export class BaseRepositoryImpl<T extends Entity> implements BaseRepository<T> {
  private documentDao: DocumentDao<T>;

  constructor(SchemaModel: Model<T>) {
    this.documentDao = new DocumentDao<T>(SchemaModel);
  }

  public count$(conditions: any): Observable<number> {
    return new Observable((observer: Subscriber<number>) => {
      this.documentDao.count(conditions).then(
        (result: number) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public distinct$(field: string, conditions?: any): Observable<string[]> {
    return new Observable((observer: Subscriber<string[]>) => {
      this.documentDao.distinct(field, conditions).then(
        (result: string[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public find$(
    query?: any,
    projection?: any,
    options?: any
  ): Observable<{ count: number; result: T[] }> {
    return new Observable(
      (observer: Subscriber<{ count: number; result: T[] }>) => {
        this.documentDao.find(query, projection, options).then(
          ({ count, result }) => {
            observer.next({ count, result });
            observer.complete();
          },
          (error: unknown) => {
            observer.error(error);
          }
        );
      }
    );
  }

  public findAll$(
    conditions?: any,
    projection?: any,
    options?: any
  ): Observable<T[]> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.findAll(conditions, projection, options).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findAllByIds$(ids: string[] = []): Observable<T[]> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.findAllByIds(ids).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findById$(id: string): Observable<T | null> {
    return new Observable((observer: Subscriber<T | null>) => {
      this.documentDao.findById(id).then(
        (result: T | null) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findByIdAndUpdate$(id: string, update: any): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findByIdAndUpdate(id, update).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findOne$(conditions: any, projection?: any): Observable<T | null> {
    return new Observable((observer: Subscriber<T | null>) => {
      this.documentDao.findOne(conditions, projection).then(
        (result: T | null) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findOneAndUpdate$(
    conditions: any,
    update: any,
    options: any = { new: true, overwrite: false }
  ): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findOneAndUpdate(conditions, update, options).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findOneAndUpsert$(
    conditions: any,
    update: any,
    options: any = { new: true, setDefaultsOnInsert: true, upsert: true }
  ): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.findOneAndUpsert(conditions, update, options).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public findOneOrCreate$(
    conditions: any,
    mergeContents: any = {}
  ): Observable<T> {
    const options: any = { new: true, setDefaultsOnInsert: true, upsert: true };
    return this.findOneAndUpsert$(conditions, mergeContents, options);
  }

  public insert$(obj: Entity): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.insert(obj).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public insertMany$(objs: Entity[]): Observable<T[]> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.insertMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public remove$(id: string): Observable<void> {
    return new Observable((observer: Subscriber<void>) => {
      this.documentDao.remove(id).then(
        () => {
          observer.next();
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public save$(obj: Entity): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.documentDao.save(obj).then(
        (result: T) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public saveMany$(objs: Entity[]): Observable<T[]> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.saveMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public updateMany$(objs: Entity[]): Observable<any> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.updateMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }

  public upsertMany$(objs: Entity[]): Observable<any> {
    return new Observable((observer: Subscriber<T[]>) => {
      this.documentDao.upsertMany(objs).then(
        (result: T[]) => {
          observer.next(result);
          observer.complete();
        },
        (error: unknown) => {
          observer.error(error);
        }
      );
    });
  }
}
