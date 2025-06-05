import {createEvent, createStore} from "effector";

export const bannerDeleteModal = createEvent<boolean>();
export const bannerDeleteModalReset = createEvent()
export const $bannerIsOpen = createStore<boolean>(false)
  .on(bannerDeleteModal, (_, payload) => payload)
  .reset(bannerDeleteModalReset)

export const bannerDeleteElemEvent = createEvent<number>()
export const $bannerDeleteElem = createStore<number | null>(null)
  .on(bannerDeleteElemEvent, (_, payload) => payload)
  .reset(bannerDeleteModalReset)