import {createEffect, createEvent, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {IBookingPost} from "./interfaceBooking.ts";

const api = new ApiCore()

export const bookingsPutReset = createEvent();
export const bookingsPutFx = createEffect(async ({id, data}:{id: number, data: IBookingPost}) => {
  await api.post(`${URLShikana}/api/admin/bookings/${id}`, data)
})

export const $bookingsPutError = createStore<string>("")
  .on(bookingsPutFx.failData, (_, payload) => payload.message)
  .reset(bookingsPutReset)

export const $bookingsPutLoading = createStore<boolean>(false)
  .on(bookingsPutFx.pending, (_, payload) => payload)
  .reset(bookingsPutReset)
