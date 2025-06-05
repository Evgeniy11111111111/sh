export interface IMeta {
  current_page?: number,
  from?: number,
  last_page?: number,
  links?: IMetaLinks[],
  path?: string,
  per_page?: number,
  to?: number,
  total?: number
}

export interface IMetaLinks {
  url: null | string,
  label: string,
  active: boolean
}

export interface ILinks {
  first: string,
  last: string,
  prev: string | null,
  next: string | null
}

export interface GetData<T> {
  data: T,
  meta: IMeta,
  links: ILinks
}