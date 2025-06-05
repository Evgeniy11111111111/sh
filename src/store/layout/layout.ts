import {createEvent, createStore} from "effector";

export enum ELeftSidebar {
  default = 'default',
  condensed = 'condensed',
  full = 'full',
  fullscreen = 'fullscreen'
}

export const leftSidebarChangeType = createEvent<ELeftSidebar>();
export const $leftSidebarType = createStore<ELeftSidebar>(ELeftSidebar.default)
  .on(leftSidebarChangeType, (_, payload) => payload)