import {createEvent, createStore} from "effector";
import {persist} from "effector-storage/local";

export const resetToken = createEvent()
export const changeToken = createEvent<string>();
export const $token = createStore<string>("")
  .on(changeToken, (_, payload) => payload)
  .reset(resetToken)
persist({
  store: $token,
  key: "shik-token"
})