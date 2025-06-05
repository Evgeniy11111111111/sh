import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEvent, createStore} from "effector";
import {createEffect} from "effector/effector.umd";
import {URLShikana} from "../../constants/url.ts";
import {IBookingPost} from "./interfaceBooking.ts";

const api = new ApiCore()
export const bookingPostReset = createEvent();
export const bookingPostFx = createEffect(async (data: IBookingPost) => {
  await api.post(`${URLShikana}/api/admin/bookings`, data)
})

export const $bookingPostError = createStore<string>("")
  .on(bookingPostFx.failData, (_, payload) => payload.message)

export const $bookingPostLoading = createStore<boolean>(false)
  .on(bookingPostFx.pending, (_, payload) => payload)
