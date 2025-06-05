import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {IAddBanner} from "./addBanner.ts";
import {bannersGetFx} from "./getBanner.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()
export const bannerPutReset = createEvent();
export const bannerPutFx = createEffect(async ({id, data}:{id: number, data: IAddBanner}) => {
  api.contentTypeMultipart();
  await api.post(`${URLShikana}/api/admin/banners/${id}`, data)
})

export const $bannerPutError = createStore<string>("")
  .on(bannerPutFx.failData, (_, payload) => payload.message)
  .reset(bannerPutReset)

export const $bannerPutLoading = createStore<boolean>(false)
  .on(bannerPutFx.pending, (_, payload) => payload)
  .reset(bannerPutReset)

bannerPutFx.doneData.watch(async () => {
  api.contentTypeJson()
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || '1';
  await bannersGetFx(page)
})

bannerPutFx.finally.watch(() => {
  api.contentTypeJson()
})