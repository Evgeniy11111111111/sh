import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {bannersGetFx} from "./getBanner.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const bannerDeleteReset = createEvent()

export const bannerDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/banners/${id}`)
})

export const $bannerDeleteLoading = createStore<boolean>(false)
  .on(bannerDeleteFx.pending, (_, payload) => payload)
  .reset(bannerDeleteReset)

export const $bannerDeleteError = createStore<string>("")
  .on(bannerDeleteFx.failData, (_, payload) => payload.message)
  .reset(bannerDeleteReset)

bannerDeleteFx.doneData.watch(async () => {
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || '1';
  await bannersGetFx(page)
})
