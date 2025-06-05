import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const eventsDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/children-activities/packages/${id}`)
})

export const $eventsDeleteLoading = createStore<boolean>(false)
  .on(eventsDeleteFx.pending, (_, payload) => payload)

export const categoriesDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/children-activities/categories/${id}`)
})

export const $categoriesDeleteLoading = createStore<boolean>(false)
  .on(eventsDeleteFx.pending, (_, payload) => payload)