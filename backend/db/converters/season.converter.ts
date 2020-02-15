import { Observable } from "rxjs";

import { SeasonConverter as LigiSeasonConverter } from "../converters/ligi/season.converter";
import { SeasonConverter as AfdSeasonConverter } from "../converters/apiFootballData/season.converter";
import { IConverter } from "./converter";
import { ISeason } from "../models/season.model";
import { FootballApiProvider as ApiProvider } from "../../common/footballApiProvider";

export interface ISeasonConverter extends IConverter {
  from(data: any): Observable<ISeason>;
}

export abstract class SeasonConverter {
  static getInstance(provider: ApiProvider): ISeasonConverter {
    switch (provider) {
      case ApiProvider.LIGI:
        return LigiSeasonConverter.getInstance();
      case ApiProvider.API_FOOTBALL_DATA:
        return AfdSeasonConverter.getInstance();
      default:
        throw new Error("Converter for Provider does not exist");
    }
  }
}
