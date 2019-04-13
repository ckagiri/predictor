import { Observable } from 'rxjs';
import { IEntity } from '../models/base.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface IConverter {
  from(data: any): Observable<IEntity>; 
  provider: ApiProvider;
}