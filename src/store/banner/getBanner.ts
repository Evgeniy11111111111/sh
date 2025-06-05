import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {GetData, IMeta} from "../../interface/meta.ts";
import {INewsGetData} from "../news/getNews.ts";
import {URLShikana} from "../../constants/url.ts";
import {ILocationsGetData} from "../location/getLocations.ts";

const api = new ApiCore()

export interface IBannersGet {
  id: number,
  name: string,
  entity: string
  description: string,
  sort: number,
  active: number,
  image: string
  resource: INewsGetData | ILocationsGetData
}


export const bannersGetFx = createEffect(async (page: string) => {
  const res = await api.get(`${URLShikana}/api/admin/banners?page=${page}`)
  return res.data
})

export const $bannersStore = createStore<IBannersGet[]>([])
  .on(bannersGetFx.doneData, (_, payload: GetData<IBannersGet[]>) => payload.data)

export const $bannersError = createStore<string>("")
  .on(bannersGetFx.failData, (_, payload) => payload.message);

export const $bannersLoading = createStore<boolean>(false)
  .on(bannersGetFx.pending, (_, payload) => payload)

export const $bannersMetaStore = createStore<IMeta>({})
  .on(bannersGetFx.doneData, (_, payload: GetData<IBannersGet[]>) => payload.meta)