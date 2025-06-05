import {createEvent, createStore} from "effector";

export const legalDeleteModal = createEvent<boolean>();
export const legalDeleteModalReset = createEvent()
export const $legalIsOpen = createStore<boolean>(false)
  .on(legalDeleteModal, (_, payload) => payload)
  .reset(legalDeleteModalReset)

export const legalDeleteElemEvent = createEvent<number>()
export const $legalDeleteElem = createStore<number | null>(null)
  .on(legalDeleteElemEvent, (_, payload) => payload)
  .reset(legalDeleteModalReset)