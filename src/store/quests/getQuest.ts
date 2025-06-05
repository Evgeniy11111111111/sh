import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IPricesDay {
  holidays?: {
    price?: number | null,
    per_player?: number | null
  },
  weekday?: {
    price?: number | null,
    per_player?: number | null
  },
  weekends?: {
    price?: number | null,
    per_player?: number | null
  },
}

export interface IQuestsGet {
  code: string,
  description: string | null,
  image: string | null,
  name: string
  minute_duration: number | null
  people_from: number | null
  people_limit: number | null
  without_pay_count: number | null
  prices: IPricesDay | null
}

export const getQuestFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/quests`)
  return res.data
})

export const $questsStore = createStore<IQuestsGet[]>([])
  .on(getQuestFx.doneData, (_, payload) => payload.data)

export const $questsLoading = createStore<boolean>(false)
  .on(getQuestFx.pending, (_, payload) => payload)