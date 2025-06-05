import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IRestaurantGet {
  id: number
  title: string,
  images: {
    id: number,
    url: string
  }[]
}

export const getRestaurantFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/cafe-menu`)
  return res.data;
})

export const $restaurantCategory = createStore<IRestaurantGet[]>([])
  .on(getRestaurantFx.doneData, (_, payload) => payload.data)

export const $restaurantCategoryLoading = createStore(false)
  .on(getRestaurantFx.pending, (_, payload) => payload)

