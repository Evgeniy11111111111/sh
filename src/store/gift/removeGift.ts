import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {giftGetFx} from "./getGift.ts";
import {URLShikana} from "../../constants/url.ts";


const api = new ApiCore()

export const giftDeleteReset = createEvent()

export const giftDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/gift-certificates/${id}`)
})

export const $giftDeleteLoading = createStore<boolean>(false)
  .on(giftDeleteFx.pending, (_, payload) => payload)
  .reset(giftDeleteReset)

export const $giftDeleteError = createStore<string>("")
  .on(giftDeleteFx.failData, (_, payload) => payload.message)
  .reset(giftDeleteReset)

giftDeleteFx.doneData.watch(async () => {
  await giftGetFx()
})