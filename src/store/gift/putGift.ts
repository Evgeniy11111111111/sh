import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {giftGetFx} from "./getGift.ts";
import {IAddGift} from "./addGift.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()
export const giftPutReset = createEvent();
export const giftPutFx = createEffect(async ({id, data}:{id: number, data: IAddGift}) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/gift-certificates/${id}`, data)
})

export const $giftPutError = createStore<string>("")
  .on(giftPutFx.failData, (_, payload) => payload.message)
  .reset(giftPutReset)

export const $giftPutLoading = createStore<boolean>(false)
  .on(giftPutFx.pending, (_, payload) => payload)
  .reset(giftPutReset)

giftPutFx.doneData.watch(async () => {
  api.contentTypeJson()
  await giftGetFx()
})