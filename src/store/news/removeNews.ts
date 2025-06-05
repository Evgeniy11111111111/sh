import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const newsDeleteReset = createEvent()

export const newsDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/news/${id}`)
})

export const $newsDeleteLoading = createStore<boolean>(false)
  .on(newsDeleteFx.pending, (_, payload) => payload)
  .reset(newsDeleteReset)

export const $newsDeleteError = createStore<string>("")
  .on(newsDeleteFx.failData, (_, payload) => payload.message)
  .reset(newsDeleteReset)
