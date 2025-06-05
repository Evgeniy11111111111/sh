import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {giftSampleGetFx} from "./getGiftSample.ts";
import {URLShikana} from "../../../constants/url.ts";


const api = new ApiCore()

export const giftSampleDeleteReset = createEvent()

export const giftSampleDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/gift-certificate-templates/${id}`)
})

export const $giftSampleDeleteLoading = createStore<boolean>(false)
  .on(giftSampleDeleteFx.pending, (_, payload) => payload)
  .reset(giftSampleDeleteReset)

export const $giftSampleDeleteError = createStore<string>("")
  .on(giftSampleDeleteFx.failData, (_, payload) => payload.message)
  .reset(giftSampleDeleteReset)

giftSampleDeleteFx.doneData.watch(async () => {
  await giftSampleGetFx()
})