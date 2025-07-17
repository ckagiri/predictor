import { ComponentType, ReactElement, ReactNode } from 'react';

export type Identifier = string | number;
export interface UiRecord<IdentifierType extends Identifier = Identifier>
  extends Record<string, any> {
  id: IdentifierType;
  slug?: string;
}

export interface ResourceOptions {
  label?: string;
  [key: string]: any;
}

export interface SortPayload {
  field?: string;
  order?: 'ASC' | 'DESC';
}
export interface FilterPayload {
  [k: string]: any;
}
export interface PaginationPayload {
  page: number;
  perPage: number;
}

export interface QueryFunctionContext {
  signal?: AbortSignal;
}

export interface GetListParams {
  pagination?: PaginationPayload;
  sort?: SortPayload;
  filter?: any;
  meta?: any;
  signal?: AbortSignal;
}
export interface GetListResult<RecordType extends UiRecord = any> {
  data: RecordType[];
  total?: number;
  pageInfo?: {
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  meta?: any;
}

export interface GetOneParams<RecordType extends UiRecord = any> {
  id: RecordType['id'];
  meta?: any;
  signal?: AbortSignal;
}
export interface GetOneResult<RecordType extends UiRecord = any> {
  data: RecordType;
  meta?: any;
}

export interface GetManyParams<RecordType extends UiRecord = any> {
  ids: RecordType['id'][];
  meta?: any;
  signal?: AbortSignal;
}
export interface GetManyResult<RecordType extends UiRecord = any> {
  data: RecordType[];
  meta?: any;
}

export interface UpdateParams<RecordType extends UiRecord = any> {
  id: RecordType['id'];
  data: Partial<RecordType>;
  previousData: RecordType;
  meta?: any;
}
export interface UpdateResult<RecordType extends UiRecord = any> {
  data: RecordType;
  meta?: any;
}

export interface UpdateManyParams<T = any> {
  ids: Identifier[];
  data: Partial<T>;
  meta?: any;
}
export interface UpdateManyResult<RecordType extends UiRecord = any> {
  data?: RecordType['id'][];
  meta?: any;
}

export interface CreateParams<T = any> {
  data: Partial<T>;
  meta?: any;
}
export interface CreateResult<RecordType extends UiRecord = any> {
  data: RecordType;
  meta?: any;
}

export interface DeleteParams<RecordType extends UiRecord = any> {
  id: RecordType['id'];
  previousData?: RecordType;
  meta?: any;
}
export interface DeleteResult<RecordType extends UiRecord = any> {
  data: RecordType;
  meta?: any;
}

export interface DeleteManyParams<RecordType extends UiRecord = any> {
  ids: RecordType['id'][];
  meta?: any;
}
export interface DeleteManyResult<RecordType extends UiRecord = any> {
  data?: RecordType['id'][];
  meta?: any;
}
export type RecordToStringFunction = (record: any) => string;

export interface ResourceDefinition<OptionsType extends ResourceOptions = any> {
  readonly name: string;
  readonly route: string;
  readonly options?: OptionsType;
  readonly hasList?: boolean;
  readonly hasEdit?: boolean;
  readonly hasShow?: boolean;
  readonly hasCreate?: boolean;
  readonly icon?: any;
  readonly recordRepresentation?:
    | ReactElement
    | RecordToStringFunction
    | string;
}
export interface ResourceProps {
  name: string;
  route?: string;
  list?: ComponentType<any> | ReactElement;
  create?: ComponentType<any> | ReactElement;
  edit?: ComponentType<any> | ReactElement;
  show?: ComponentType<any> | ReactElement;
  hasCreate?: boolean;
  hasEdit?: boolean;
  hasShow?: boolean;
  icon?: ComponentType<any>;
  recordRepresentation?: ReactElement | RecordToStringFunction | string;
  options?: ResourceOptions;
  children?: ReactNode;
}

export type ResourceElement = ReactElement<ResourceProps>;
export type RenderResourcesFunction = (permissions: any) =>
  | ReactNode // (permissions) => <><Resource /><Resource /><Resource /></>
  | ResourceElement[]; // (permissions) => [<Resource />, <Resource />, <Resource />]
export type FrameChildren =
  | RenderResourcesFunction
  | Iterable<ReactNode | RenderResourcesFunction>
  | ReactNode;

export type TitleComponent = ComponentType<object> | ReactElement<any>;
export type CatchAllComponent = ComponentType<{ title?: TitleComponent }>;

export interface CoreLayoutProps {
  children: ReactNode;
}

export type LayoutComponent = ComponentType<CoreLayoutProps>;
export type LoadingComponent = ComponentType<{
  loadingPrimary?: string;
  loadingSecondary?: string;
}>;

export type ResourceItem = {
  name?: string;
  route?: string;
  path?: string;
};

export type DataProvider<ResourceType extends string = string> = {
  getList: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: GetListParams & QueryFunctionContext
  ) => Promise<GetListResult<RecordType>>;

  getOne: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: GetOneParams<RecordType> & QueryFunctionContext
  ) => Promise<GetOneResult<RecordType>>;

  getMany: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: GetManyParams<RecordType> & QueryFunctionContext
  ) => Promise<GetManyResult<RecordType>>;

  update: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: UpdateParams
  ) => Promise<UpdateResult<RecordType>>;

  updateMany: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: UpdateManyParams
  ) => Promise<UpdateManyResult<RecordType>>;

  create: <
    RecordType extends Omit<UiRecord, 'id'> = any,
    ResultRecordType extends UiRecord = RecordType & { id: Identifier },
  >(
    resource: ResourceType,
    params: CreateParams
  ) => Promise<CreateResult<ResultRecordType>>;

  delete: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: DeleteParams<RecordType>
  ) => Promise<DeleteResult<RecordType>>;

  deleteMany: <RecordType extends UiRecord = any>(
    resource: ResourceType,
    params: DeleteManyParams<RecordType>
  ) => Promise<DeleteManyResult<RecordType>>;

  [key: string]: any;
  supportAbortSignal?: boolean;
};

export type DataProviderFn = (
  type: string,
  resource: string,
  params: any
) => Promise<any>;
