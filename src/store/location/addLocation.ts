import {FileType} from "../../components/FileUploader.tsx";
import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {locationsGetFx} from "./getLocations.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IAddLocation {
  name: string,
  description?: string,
  combinings?: string[],
  is_showed_main_page?: number,
  image?: FileType | null,
  _method?: TMethodForMultiple
  prices?: {
    [key: string]: {
      price: string
    } | string | undefined
  },
  work_ranges?: {
    [key: string]: {
      hour_start: string,
      hour_end: string,
      minute_start: string,
      minute_end: string
    }
  }
}

export type TMethodForMultiple = 'put'

const api = new ApiCore()

export const locationPostReset = createEvent();

export const locationPostFx = createEffect(async (data: IAddLocation) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/locations`, data)
})

export const $locationPostError = createStore<string>("")
  .on(locationPostFx.failData, (_, payload) => payload.message)
  .reset(locationPostReset)

export const $locationPostLoading = createStore<boolean>(false)
  .on(locationPostFx.pending, (_, payload) => payload)
  .reset(locationPostReset)


locationPostFx.doneData.watch(async () => {
  api.contentTypeJson()
  await locationsGetFx()
})

locationPostFx.finally.watch(() => {
  api.contentTypeJson()
})

