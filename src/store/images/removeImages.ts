import {createEffect, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const imageDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/storage-files/${id}`)
})

export const $imagesDeleteLoading = createStore<boolean>(false)
  .on(imageDeleteFx.pending, (_, payload) => payload)