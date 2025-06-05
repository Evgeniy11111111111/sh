import {ApiCore} from "../../helpers/api/apiCore.ts";
import {FileType} from "../../components/FileUploader.tsx";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {combine, createEffect, createStore} from "effector";
import {URLShikana} from "../../constants/url.ts";
import {$questsLoading} from "./getQuest.ts";
import {$questsDeleteLoading} from "./removeQuests.ts";

const api = new ApiCore()

export interface IAddQuests {
  name: string,
  description: string,
  image?: FileType | null,
  people_from: number
  people_limit: number
  without_pay_count: number
  minute_duration: number
  prices: {
    weekday: {
      price: number
      per_player: number
    },
    weekends: {
      price: number
      per_player: number
    },
    holidays: {
      price: number
      per_player: number
    },
  }
  _method?: TMethodForMultiple
}

export const questAddFx = createEffect(async ({data, code}:{data: IAddQuests, code?: string}) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/quests${code ? "/"+code: ""}`, data)
})

export const $questAddLoading = createStore(false)
  .on(questAddFx.doneData, (_, payload) => payload)

questAddFx.finally.watch(() => {
  api.contentTypeJson()
})

export const questsCombinePost = combine(
  $questsLoading,
  $questAddLoading,
  $questsDeleteLoading,
  (loading, addLoading, deleteLoading) => loading || deleteLoading || addLoading
)