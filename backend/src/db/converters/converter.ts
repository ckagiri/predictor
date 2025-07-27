import { Observable } from 'rxjs';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider.js';
import { Entity } from '../models/base.model.js';

export interface Converter {
  footballApiProvider: ApiProvider;
  from(data: any): Observable<Entity>;
}
