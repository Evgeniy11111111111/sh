import {createEvent, createStore} from "effector";

export const giftSampleDeleteModal = createEvent<boolean>();
export const giftSampleDeleteModalReset = createEvent()
export const $giftSampleIsOpen = createStore<boolean>(false)
  .on(giftSampleDeleteModal, (_, payload) => payload)
  .reset(giftSampleDeleteModalReset)

export const giftSampleDeleteElemEvent = createEvent<number>()
export const $giftSampleDeleteElem = createStore<number | null>(null)
  .on(giftSampleDeleteElemEvent, (_, payload) => payload)
  .reset(giftSampleDeleteModalReset)