import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const restaurantDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/cafe-menu/${id}`)
})

export const $restaurantDeleteLoading = createStore(false)
  .on(restaurantDeleteFx.pending, (_, payload) => payload)