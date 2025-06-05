import {ApiCore} from "../../helpers/api/apiCore.ts";
import {FileType} from "../../components/FileUploader.tsx";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export interface IPostImage {
  file: FileType
}

export const imagesPostFx = createEffect(async (data: IPostImage) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/storage-files`, data)
})

export const $imagesPostLoading = createStore(false)
  .on(imagesPostFx.pending, (_, payload) => payload)

imagesPostFx.finally.watch(() => {
  api.contentTypeJson()
})