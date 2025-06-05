import {createEffect, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {GetData, IMeta} from "../../interface/meta.ts";
import {IUserGet} from "../users/getUsers.ts";
import {IGiftSampleGet} from "./sample/getGiftSample.ts";
import {URLShikana} from "../../constants/url.ts";


export interface IGiftGet {
  id: number
  sum: number
  ended_at: string
  author: IUserGet,
  owner: IUserGet
  template: IGiftSampleGet
  status: {
    code: string,
    name: string
  }
}

const api = new ApiCore()

export const giftGetFx = createEffect( async (string?: string) => {
  const res = await api.get(`${URLShikana}/api/admin/gift-certificates?${string}`)
  return res.data
})

export const $giftStore = createStore<IGiftGet[]>([])
  .on(giftGetFx.doneData, (_, payload: GetData<IGiftGet[]>) => payload.data)
export const $giftError = createStore<string>("")
  .on(giftGetFx.failData, (_, payload) => payload.message);

export const $giftLoading = createStore<boolean>(false)
  .on(giftGetFx.pending, (_, payload) => payload)

export const $giftMetaStore = createStore<IMeta>({})
  .on(giftGetFx.doneData, (_, payload: GetData<IGiftGet>) => payload.meta)
