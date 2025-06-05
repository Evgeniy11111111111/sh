import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const questsDeleteFx = createEffect(async (code: string) => {
  await api.remove(`${URLShikana}/api/admin/quests/${code}`)
})

export const $questsDeleteLoading = createStore<boolean>(false)
  .on(questsDeleteFx.pending, (_, payload) => payload)
