export interface MenuItemTypes {
  key: string;
  label: string;
  isTitle?: boolean;
  icon?: string;
  url?: string;
  badge?: {
    variant: string;
    text: string;
  };
  parentKey?: string;
  target?: string;
  children?: MenuItemTypes[];
}

const MENU_LOCATION: MenuItemTypes = {
  key: "location",
  label: "Локации",
  isTitle: false,
  icon: "grid",
  url: "/location"
}

const MENU_EVENTS: MenuItemTypes = {
  key: "events",
  label: "Мероприятия",
  isTitle: false,
  icon: "package",
  url: "/events"
}

const MENU_QUESTS: MenuItemTypes = {
  key: "quests",
  label: "Квесты",
  isTitle: false,
  icon: "package",
  url: "/quests"
}

const MENU_RESTAURANT: MenuItemTypes = {
  key: "restaurant",
  label: "Меню ресторана",
  isTitle: false,
  icon: 'octagon',
  url: "/restaurant-menu"
}

const MENU_ADMIN: MenuItemTypes = {
  key: 'administrator',
  label: "Администраторы",
  isTitle: false,
  icon: 'user',
  url: '/administrators'
}

const MENU_USERS: MenuItemTypes = {
  key: "users",
  label: "Пользователи",
  isTitle: false,
  icon: 'users',
  url: '/users'
}

const MENU_NEWS: MenuItemTypes = {
  key: 'news',
  label: "Новости",
  isTitle: false,
  icon: 'book-open',
  url: '/news'
}

const MENU_CONTACTS: MenuItemTypes = {
  key: 'contacts',
  label: 'Контакты',
  isTitle: false,
  icon: 'phone',
  url: "/contacts"
}

const MENU_BANNERS: MenuItemTypes = {
  key: 'banners',
  label: 'Баннеры',
  isTitle: false,
  icon: 'image',
  url: "/banners"
}

const MENU_GIFT: MenuItemTypes = {
  key: "gift",
  label: "Подарочные сертификаты",
  isTitle: false,
  icon: "gift",
  url: "/gift"
}

const MENU_LEGAL: MenuItemTypes = {
  key: "legal",
  label: "Правовая информация",
  isTitle: false,
  icon: "file",
  url: "/legal"
}

const MENU_OPERATION_MODE: MenuItemTypes = {
  key: "operationMode",
  label: "Режим работы",
  isTitle: false,
  icon: "disc",
  url: "/operation-mode"
}

const MENU_IMAGES: MenuItemTypes = {
  key: "images",
  label: "Изображения",
  isTitle: false,
  icon: "image",
  url: "/images"
}

const MENU_SUPER_ADMIN_AFTER_LOCATIONS: MenuItemTypes[] = [
  MENU_EVENTS,
  MENU_QUESTS,
  MENU_ADMIN,
  MENU_USERS,
  MENU_NEWS,
  MENU_RESTAURANT,
  MENU_OPERATION_MODE,
  MENU_IMAGES,
  MENU_CONTACTS,
  MENU_BANNERS,
  MENU_GIFT,
  MENU_LEGAL
]

const MENU_ADMIN_AFTER_LOCATIONS: MenuItemTypes[] = [
  MENU_EVENTS,
  MENU_QUESTS,
  MENU_USERS,
  MENU_NEWS,
  MENU_RESTAURANT,
  MENU_OPERATION_MODE,
  MENU_IMAGES,
  MENU_CONTACTS,
  MENU_BANNERS,
  MENU_GIFT,
  MENU_LEGAL
]

const MENU_MANAGER_AFTER_LOCATIONS: MenuItemTypes[] = [
  MENU_EVENTS, MENU_QUESTS, MENU_USERS, MENU_GIFT, MENU_OPERATION_MODE
]

const MENU_CONTENT_MANAGER_AFTER_LOCATIONS: MenuItemTypes[] = [
  MENU_EVENTS, MENU_QUESTS, MENU_USERS, MENU_NEWS, MENU_RESTAURANT, MENU_OPERATION_MODE, MENU_IMAGES, MENU_CONTACTS, MENU_BANNERS, MENU_GIFT, MENU_LEGAL
]

export {
  MENU_SUPER_ADMIN_AFTER_LOCATIONS,
  MENU_ADMIN_AFTER_LOCATIONS,
  MENU_MANAGER_AFTER_LOCATIONS,
  MENU_CONTENT_MANAGER_AFTER_LOCATIONS,
  MENU_LOCATION,
}