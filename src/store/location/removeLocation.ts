import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {locationsGetFx} from "./getLocations.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const locationDeleteReset = createEvent()

export const locationDeleteFx = createEffect(async (id: string) => {
  await api.remove(`${URLShikana}/api/admin/locations/${id}`)
})

export const $locationDeleteLoading = createStore<boolean>(false)
  .on(locationDeleteFx.pending, (_, payload) => payload)
  .reset(locationDeleteReset)

export const $locationDeleteError = createStore<string>("")
  .on(locationDeleteFx.failData, (_, payload) => payload.message)
  .reset(locationDeleteReset)

locationDeleteFx.doneData.watch(async () => {
  await locationsGetFx()
})