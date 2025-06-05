import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IPostOperationMode {
  date: string
  work_schedules: {
    location_code: string,
    opened_at: string | null,
    closed_at: string | null
  }[],
  _method?: TMethodForMultiple
}

export const postOperationModeFx = createEffect(async (data: IPostOperationMode) => {
  await api.post(`${URLShikana}/api/admin/locations/work-schedule`, data)
})

export const $postOperationModeLoading = createStore<boolean>(false)
  .on(postOperationModeFx.pending, (_, payload) => payload)