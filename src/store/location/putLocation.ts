import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {IAddLocation} from "./addLocation.ts";
import {locationsGetFx} from "./getLocations.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()
export const locationPutReset = createEvent();
export const locationPutFx = createEffect(async ({id, data}:{id: string, data: IAddLocation}) => {
  api.contentTypeMultipart();
  await api.post(`${URLShikana}/api/admin/locations/${id}`, data)
})

export const $locationPutError = createStore<string>("")
  .on(locationPutFx.failData, (_, payload) => payload.message)
  .reset(locationPutReset)

export const $locationPutLoading = createStore<boolean>(false)
  .on(locationPutFx.pending, (_, payload) => payload)
  .reset(locationPutReset)

locationPutFx.doneData.watch(async () => {
  api.contentTypeJson()
  await locationsGetFx()
})

locationPutFx.finally.watch(() => {
  api.contentTypeJson()
})