import {createEffect, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {GetData, IMeta} from "../../interface/meta.ts";
import {URLShikana} from "../../constants/url.ts";

export interface INewsGetData {
  id: number,
  name: string,
  description: string,
  short_description: string | null,
  published_at: string,
  is_published: number,
  image: string
}



const api = new ApiCore()
export const newsGetFx = createEffect( async (id: string) => {
  const res = await api.get(`${URLShikana}/api/admin/news?page=${id}`)
  return res.data
})

export const $newsStore = createStore<INewsGetData[]>([])
  .on(newsGetFx.doneData, (_, payload: GetData<INewsGetData[]>) => payload.data)

export const $newsError = createStore<string>("")
  .on(newsGetFx.failData, (_, payload) => payload.message);

export const $newsLoading = createStore<boolean>(false)
  .on(newsGetFx.pending, (_, payload) => payload)

export const $newsMetaStore = createStore<IMeta>({})
  .on(newsGetFx.doneData, (_, payload: GetData<INewsGetData[]>) => payload.meta)