import {ApiCore} from "../../helpers/api/apiCore.ts";
import {combine, createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {$packagesEventsLoading} from "./getEvents.tsx";
import {$eventsDeleteLoading} from "./removeEvents.tsx";

const api = new ApiCore()

export interface IPackageEventsPost {
  category_id: number | null
  name: string | null
  age_from?: number | null
  age_to?: number | null
  content?: string | null
  minute_duration_from?: number | null
  minute_duration_to?: number | null
  people_from?: number | null
  people_limit?: number | null
  people_to?: number | null
  original_price?: number | null
  price_per_max_people?: number | null
  _method?: TMethodForMultiple
}

export const eventsPostFx = createEffect(async ({data, id}: {data: IPackageEventsPost, id?: number | string}) => {
  await api.post(`${URLShikana}/api/admin/children-activities/packages${id ? "/"+id : ""}`, data)
})

export const $eventsPostLoading = createStore(false)
  .on(eventsPostFx.pending, (_, payload) => payload)

export const eventsCombinePost = combine(
  $packagesEventsLoading,
  $eventsPostLoading,
  $eventsDeleteLoading,
  (catalogLoading, loading, removeLoading) => loading || catalogLoading || removeLoading
)

export interface ICategoriesEventsPost {
  name: string,
  parent_id?: number | null,
  _method?: TMethodForMultiple
}

export const categoriesPostFx = createEffect(async ({data, id}: {data: ICategoriesEventsPost, id?: number | string}) => {
  await api.post(`${URLShikana}/api/admin/children-activities/categories${id? "/"+id : ""}`, data)
})

export const $categoriesPostLoading = createStore(false)
  .on(categoriesPostFx.pending, (_, payload) => payload)