import {createEvent, createStore} from "effector";
import {IGiftGet} from "./getGift.ts";

export const giftDeleteModal = createEvent<boolean>();
export const giftDeleteModalReset = createEvent()
export const $giftIsOpen = createStore<boolean>(false)
  .on(giftDeleteModal, (_, payload) => payload)
  .reset(giftDeleteModalReset)

export const giftDeleteElemEvent = createEvent<number>()
export const $giftDeleteElem = createStore<number | null>(null)
  .on(giftDeleteElemEvent, (_, payload) => payload)
  .reset(giftDeleteModalReset)

export const giftEditModal = createEvent<IGiftGet | null>()
export const $giftIsEdit = createStore<IGiftGet | null>(null)
  .on(giftEditModal, (_, payload) => payload)
  .reset(giftDeleteModalReset)

export const giftImageModal = createEvent<string | null>()

export const $giftImagePath = createStore<string | null>(null)
  .on(giftImageModal, (_, payload) => payload)
  .reset(giftDeleteModalReset)