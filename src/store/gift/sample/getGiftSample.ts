import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../../constants/url.ts";

export interface IGiftSampleGet {
  id: number,
  name: string,
  image: string
}

export interface IGiftSampleGetData {
  data: IGiftSampleGet[]
}

const api = new ApiCore()

export const giftSampleGetFx = createEffect( async () => {
  const res = await api.get(`${URLShikana}/api/admin/gift-certificate-templates`)
  return res.data
})

export const $giftSampleStore = createStore<IGiftSampleGet[]>([])
  .on(giftSampleGetFx.doneData, (_, payload: IGiftSampleGetData) => payload.data)
export const $giftSampleError = createStore<string>("")
  .on(giftSampleGetFx.failData, (_, payload) => payload.message);

export const $giftSampleLoading = createStore<boolean>(false)
  .on(giftSampleGetFx.pending, (_, payload) => payload)
