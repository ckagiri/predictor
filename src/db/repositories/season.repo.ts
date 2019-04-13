import { Observable } from "rxjs";

import { ISeasonDocument, Season } from "../models/season.model";
import {
  IBaseProviderRepository,
  BaseProviderRepository
} from "./baseProvider.repo";
import {
  ISeasonConverter,
  SeasonConverter
} from "../converters/season.converter";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface ISeasonRepository
  extends IBaseProviderRepository<ISeasonDocument> {}

export class SeasonRepository extends BaseProviderRepository<ISeasonDocument>
  implements ISeasonRepository {
  static getInstance(provider: ApiProvider): ISeasonRepository {
    return new SeasonRepository(SeasonConverter.getInstance(provider));
  }

  constructor(converter: ISeasonConverter) {
    super(Season, converter);
  }
}
