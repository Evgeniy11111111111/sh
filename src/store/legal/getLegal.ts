import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore();

export interface ILegalGetData {
  id: number,
  name: string,
  description?: string | null,
  sort?: number,
  document?: string,
}

export interface ILegalGet {
  data?: ILegalGetData[]
}

export const legalGetFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/info-docs`)
  return res.data
})

export const $legalStore = createStore<ILegalGetData[]>([])
  .on(legalGetFx.doneData, (_, payload: ILegalGet) => payload.data)
