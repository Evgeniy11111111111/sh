import {createEvent, createStore} from "effector";

export const contactsDeleteModal = createEvent<boolean>();
export const contactsDeleteModalReset = createEvent()
export const $contactsIsOpen = createStore<boolean>(false)
  .on(contactsDeleteModal, (_, payload) => payload)
  .reset(contactsDeleteModalReset)

export const contactsDeleteElemEvent = createEvent<number>()
export const $contactsDeleteElem = createStore<number | null>(null)
  .on(contactsDeleteElemEvent, (_, payload) => payload)
  .reset(contactsDeleteModalReset)