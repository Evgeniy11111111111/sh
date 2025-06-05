import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {IAddNews} from "./addNews.ts";
import {newsGetFx} from "./getNews.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()
export const newsPutReset = createEvent();
export const newsPutFx = createEffect(async ({id, data}:{id: number, data: IAddNews}) => {
  api.contentTypeMultipart();
  await api.post(`${URLShikana}/api/admin/news/${id}`, data)
})

export const $newsPutError = createStore<string>("")
  .on(newsPutFx.failData, (_, payload) => payload.message)
  .reset(newsPutReset)

export const $newsPutLoading = createStore<boolean>(false)
  .on(newsPutFx.pending, (_, payload) => payload)
  .reset(newsPutReset)

newsPutFx.doneData.watch(async () => {
  api.contentTypeJson()
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || '1';
  await newsGetFx(page)
})

newsPutFx.finally.watch(() => {
  api.contentTypeJson()
})