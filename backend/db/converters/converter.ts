import { Observable } from 'rxjs';
import { Entity } from '../models/base.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface Converter {
  footballApiProvider: ApiProvider;
  from(data: any): Observable<Entity>;
}
