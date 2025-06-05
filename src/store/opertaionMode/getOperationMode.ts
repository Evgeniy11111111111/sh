

import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IOperationMode {
  "location_code": string,
  "location_name": string,
  "opened_at": string | null,
  "closed_at": string | null
}

export const getOperationModeFx = createEffect(async (date: string) => {
  const res = await api.get(`${URLShikana}/api/admin/locations/work-schedule?date=${date}`)
  return res.data
})

export const $operationMode = createStore<IOperationMode[]>([])
  .on(getOperationModeFx.doneData, (_, payload) => payload.data)

export const $operationModeLoading = createStore<boolean>(true)
  .on(getOperationModeFx.pending, (_, payload) => payload)