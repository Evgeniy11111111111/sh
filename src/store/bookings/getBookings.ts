import {combine, createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {URLShikana} from "../../constants/url.ts";
import {
  IBooking, IBookingData,
  IBookingStructure,
  IBookingStructureData,
  IBookingVariants, IBookingVariantsConfig,
  IBookingVariantsData, IBookingVariantsWorkRange
} from "./interfaceBooking.ts";

const api = new ApiCore()

export const bookingsGetFx = createEffect(async ({booking, date}: {booking: string, date?: string}) => {
  const res = await api.get(`${URLShikana}/api/admin/bookings?filter[location]=${booking}${date ? `&filter[date]=${date}` : ''}`);
  return res.data
})

export const bookingReset = createEvent()

export const $bookingsStore = createStore<IBooking[]>([])
  .on(bookingsGetFx.doneData, (_, payload: IBookingData) => payload.data)
  .reset(bookingReset)

export const $bookingsError = createStore<string>('')
  .on(bookingsGetFx.failData, (_, payload) => payload.message)
  .reset(bookingReset)

export const $bookingsLoading = createStore<boolean>(false)
  .on(bookingsGetFx.pending, (_, payload) => payload)
  .reset(bookingReset)

export const bookingsStructureFx = createEffect(async (booking: string) => {
  const res = await api.get(`${URLShikana}/api/admin/locations/${booking}/booking-structure`)
  return res.data
})

export const $bookingsStructureStore = createStore<IBookingStructure>({})
  .on(bookingsStructureFx.doneData, (_, payload: IBookingStructureData) => payload.data)
  .reset(bookingReset)

export const $bookingsStructureError = createStore<string>("")
  .on(bookingsStructureFx.fail, (_, payload) => {payload.error.message})
  .reset(bookingReset)

export const $bookingStructureLoading = createStore<boolean>(false)
  .on(bookingsStructureFx.pending, (_, payload) => payload)
  .reset(bookingReset)


export const bookingsVariantsFx = createEffect(async ({booking, date, count_people, ignoreId, packageChildren, questCode}:{booking: string, date?: string, count_people?: string, ignoreId?: string, packageChildren?: string, questCode?: string}) => {
  const res = await api.get(`${URLShikana}/api/admin/locations/${booking}/booking-variants${date ? `?started_at=${date}` : ''}${count_people ? `&count_people=${count_people}` : ''}${ignoreId ? `&ignore_booking_id=${ignoreId}` : ''}${packageChildren ? `&children_activity_package=${packageChildren}` : ''}${questCode ? `&quest_code=${questCode}` : ''}`)
  return res.data
})

export const $bookingsVariantsStore = createStore<IBookingVariants[]>([])
  .on(bookingsVariantsFx.doneData, (_, payload: IBookingVariantsData) => payload.data.variants)
  .reset(bookingReset)

export const $bookingsVariantsWorkRangeStore = createStore<IBookingVariantsWorkRange | null>(null)
  .on(bookingsVariantsFx.doneData, (_, payload: IBookingVariantsData) => payload.data.work_range || null)
  .reset(bookingReset)

export const $bookingsVariantsTimeRange = createStore<number | null>(null)
  .on(bookingsVariantsFx.doneData, (_, payload: IBookingVariantsData) => payload.data.recommended_time_range || null)
  .reset(bookingReset)

export const $bookingsVariantsConfig = createStore<IBookingVariantsConfig | null>(null)
  .on(bookingsVariantsFx.doneData, (_, payload: IBookingVariantsData) => payload.data.config || null)

export const $bookingsVariantsError = createStore<string>("")
  .on(bookingsVariantsFx.fail, (_, payload) => payload.error.message)
  .reset(bookingReset)

export const $bookingsVariantsLoading = createStore<boolean>(false)
  .on(bookingsVariantsFx.pending, (_, payload) => payload)
  .reset(bookingReset)


export const bookingsVariantsMainFx = createEffect(async ({booking, date}:{booking: string, date?: string}) => {
  const res = await api.get(`${URLShikana}/api/admin/locations/${booking}/booking-variants${date ? `?started_at=${date}` : ''}`)
  return res.data
})

export const $bookingsVariantsMainStore = createStore<IBookingVariants[]>([])
  .on(bookingsVariantsMainFx.doneData, (_, payload: IBookingVariantsData) => payload.data.variants)
  .reset(bookingReset)

export const $bookingsVariantsMainWorkRangeStore = createStore<IBookingVariantsWorkRange | null>(null)
  .on(bookingsVariantsMainFx.doneData, (_, payload: IBookingVariantsData) => payload.data.work_range)
  .reset(bookingReset)

export const $bookingsVariantsMainTimeRange = createStore<number | null>(null)
  .on(bookingsVariantsMainFx.doneData, (_, payload: IBookingVariantsData) => payload.data.recommended_time_range)
  .reset(bookingReset)

export const $bookingsVariantsMainConfig = createStore<any | null>(null)
  .on(bookingsVariantsMainFx.doneData, (_, payload: IBookingVariantsData) => payload.data.config || null)

export const $bookingsVariantsMainError = createStore<string>("")
  .on(bookingsVariantsMainFx.fail, (_, payload) => payload.error.message)
  .reset(bookingReset)

export const $bookingsVariantsMainLoading = createStore<boolean>(false)
  .on(bookingsVariantsMainFx.pending, (_, payload) => payload)
  .reset(bookingReset)

export const $bookingIsLoadingCombine = combine(
  $bookingsVariantsMainLoading,
  $bookingsLoading,
  (isLoadingVariants, isLoading) => isLoadingVariants || isLoading
)