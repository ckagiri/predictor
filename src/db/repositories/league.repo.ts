import { Observable } from "rxjs";

import { ILeagueDocument, League } from "../models/league.model";
import {
  IBaseProviderRepository,
  BaseProviderRepository
} from "./baseProvider.repo";
import {
  ILeagueConverter,
  LeagueConverter
} from "../converters/league.converter";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface ILeagueRepository
  extends IBaseProviderRepository<ILeagueDocument> {}

export class LeagueRepository extends BaseProviderRepository<ILeagueDocument>
  implements ILeagueRepository {
  static getInstance(provider: ApiProvider): ILeagueRepository {
    return new LeagueRepository(LeagueConverter.getInstance(provider));
  }

  constructor(converter: ILeagueConverter) {
    super(League, converter);
  }
}
