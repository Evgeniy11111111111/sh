import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IPackageEvents {
  age_from: number | null
  age_to: number | null
  category_id: number | null
  content: string | null
  id: number
  minute_duration_from: number | null
  minute_duration_to: number | null
  name: string | null
  people_from: number | null
  people_limit: number | null
  people_to: number | null
  price: number | null
  price_per_max_people: number | null
}

export interface ICategoriesEvents {
  id: number,
  parent_id: number | null,
  name: string | null
}

export const getCategoryEventsFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/children-activities/categories`)
  return res.data
})

export const getPackagesEventsFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/children-activities/packages`)
  return res.data
})

export const $packagesEvents = createStore<IPackageEvents[]>([])
  .on(getPackagesEventsFx.doneData, (_, payload) => payload.data)

export const $packagesEventsLoading = createStore<boolean>(false)
  .on(getPackagesEventsFx.pending, (_, payload) => payload)

export const $categoryEvents = createStore<ICategoriesEvents[]>([])
  .on(getCategoryEventsFx.doneData, (_, payload) => payload.data)

export const $categoryEventsLoading = createStore(false)
  .on(getCategoryEventsFx.pending, (_, payload) => payload)