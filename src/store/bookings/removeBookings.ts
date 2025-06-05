import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";


const api = new ApiCore()

export const bookingDeleteReset = createEvent()

export const bookingDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/bookings/${id}`)
})

export const $bookingDeleteLoading = createStore<boolean>(false)
  .on(bookingDeleteFx.pending, (_, payload) => payload)
  .reset(bookingDeleteReset)

export const $bookingDeleteError = createStore<string>("")
  .on(bookingDeleteFx.failData, (_, payload) => payload.message)
  .reset(bookingDeleteReset)