import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface ILocationsPrices {
  [key: string]: {
    price: string
    label: string
    types?: {
      [key: string]: {
        label: string
        price: string
        per_player?: string
      }
    }
  }
}

export interface ILocationsRange {
  label: string
  "hour_start": number,
  "minute_start": number,
  "hour_end": number,
  "minute_end": number
  "started_at": string,
  "ended_at": string,
}

export interface ILocationsGetData {
  code: string,
  description: string | null,
  image: string,
  combinings?: ILocationsGetData[],
  is_showed_main_page: number,
  name: string,
  prices: ILocationsPrices
  work_ranges: {
    [key: string]: ILocationsRange
  }
}

export interface ILocationsGet {
  data?: ILocationsGetData[]
}


export const locationsGetFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/locations`)
  return res.data
})

export const $locationsStore = createStore<ILocationsGetData[]>([])
  .on(locationsGetFx.doneData, (_, payload: ILocationsGet) => payload.data)

export const $locationsError = createStore<string>("")
  .on(locationsGetFx.failData, (_, payload) => payload.message);

export const $locationsLoading = createStore<boolean>(false)
  .on(locationsGetFx.pending, (_, payload) => payload)

export const locationReset = createEvent()

export const locationGetFx = createEffect(async (string: string) => {
  const res = await api.get(`${URLShikana}/api/admin/locations/${string}`)
  return res.data
})

export const $locationStore = createStore<ILocationsGetData | null>(null)
  .on(locationGetFx.doneData, (_, payload) => payload.data)
  .reset(locationReset)

export const $locationError = createStore<string>("")
  .on(locationGetFx.failData, (_, payload) => payload.message)
  .reset(locationReset)

export const $locationLoading = createStore<boolean>(false)
  .on(locationGetFx.pending, (_, payload) => payload)
  .reset(locationGetFx)