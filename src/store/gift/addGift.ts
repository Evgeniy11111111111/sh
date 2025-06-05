import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {giftGetFx} from "./getGift.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IAddGift {
  fio: string,
  phone: string,
  sum: number,
  author_id: number,
  ended_at: string,
  template_id: number
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const giftPostReset = createEvent()
export const giftPostFx = createEffect(async (data: IAddGift) => {
  await api.post(`${URLShikana}/api/admin/gift-certificates`, data)
})

export const $giftPostError = createStore<string>("")
  .on(giftPostFx.failData, (_, payload) => payload.message)
  .reset(giftPostReset)

export const $giftPostLoading = createStore<boolean>(false)
  .on(giftPostFx.pending, (_, payload) => payload)
  .reset(giftPostReset)


giftPostFx.doneData.watch(async () => {
  await giftGetFx()
})
