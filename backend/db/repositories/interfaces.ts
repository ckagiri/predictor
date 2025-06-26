export interface DatabaseOptions {
  select?: Record<string, boolean | number> | string;
}

export interface ExternalReferenceFilter {
  externalReference: Record<
    string,
    {
      id: number | string | { $in: any[] };
    }
  >;
}

export type Fields = Record<string, any>;
export type Filter = Fields & { q?: string };
export interface FindQuery {
  filter?: Filter;
  range?: Range;
  sort?: Sort;
}
export type Range = [number, number] | [number];
export type Sort = string | [string, 'asc' | 'desc'];
