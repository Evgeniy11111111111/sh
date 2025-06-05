import {FileType} from "../../components/FileUploader.tsx";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {newsGetFx} from "./getNews.ts";
import {URLShikana} from "../../constants/url.ts";
export interface IAddNews {
  name: string,
  description: string,
  short_description?: string | null,
  published_at?: string,
  image?: FileType | null,
  is_published: number,
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const newsPostReset = createEvent();

export const newsPostFx = createEffect(async (data: IAddNews) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/news`, data)
})

export const $newsPostError = createStore<string>("")
  .on(newsPostFx.failData, (_, payload) => payload.message)
  .reset(newsPostReset)

export const $newsPostLoading = createStore<boolean>(false)
  .on(newsPostFx.pending, (_, payload) => payload)
  .reset(newsPostReset)


newsPostFx.doneData.watch(async () => {
  api.contentTypeJson()
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || '1';
  await newsGetFx(page)
})

newsPostFx.finally.watch(() => {
  api.contentTypeJson()
})