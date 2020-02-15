import { ILeague, ILeagueDocument, League } from "../models/league.model";
import {
  IBaseProviderRepository,
  BaseProviderRepository
} from "./baseProvider.repo";
import {
  ILeagueConverter,
  LeagueConverter
} from "../converters/league.converter";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface ILeagueRepository extends IBaseProviderRepository<ILeague> {}

export class LeagueRepository
  extends BaseProviderRepository<ILeague, ILeagueDocument>
  implements ILeagueRepository {
  static getInstance(provider: ApiProvider): ILeagueRepository {
    return new LeagueRepository(LeagueConverter.getInstance(provider));
  }

  constructor(converter: ILeagueConverter) {
    super(League, converter);
  }
}
