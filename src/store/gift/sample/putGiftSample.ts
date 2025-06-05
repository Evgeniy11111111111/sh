import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {giftSampleGetFx} from "./getGiftSample.ts";
import {IAddGiftSample} from "./addGiftSample.ts";
import {URLShikana} from "../../../constants/url.ts";

const api = new ApiCore()
export const giftSamplePutReset = createEvent();
export const giftSamplePutFx = createEffect(async ({id, data}:{id: number, data: IAddGiftSample}) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/gift-certificate-templates/${id}`, data)
})

export const $giftSamplePutError = createStore<string>("")
  .on(giftSamplePutFx.failData, (_, payload) => payload.message)
  .reset(giftSamplePutReset)

export const $giftSamplePutLoading = createStore<boolean>(false)
  .on(giftSamplePutFx.pending, (_, payload) => payload)
  .reset(giftSamplePutReset)

giftSamplePutFx.doneData.watch(async () => {
  api.contentTypeJson()
  await giftSampleGetFx()
})

giftSamplePutFx.finally.watch(async () => {
  api.contentTypeJson()
})