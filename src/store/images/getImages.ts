import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IImagesGet {
  id: number,
  url: string
}

export const imagesGetFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/storage-files`)
  return res.data;
})

export const $imagesStore = createStore<IImagesGet[]>([])
  .on(imagesGetFx.doneData, (_, payload) => payload.data)

export const $imagesLoading = createStore<boolean>(false)
  .on(imagesGetFx.pending, (_, payload) => payload)
