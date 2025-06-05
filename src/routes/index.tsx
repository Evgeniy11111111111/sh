import React  from "react";
import { Route, RouteProps, Navigate} from "react-router-dom";
import {ILocationsGetData} from "../store/location/getLocations.ts";
const Login = React.lazy(() => import("../pages/auth/Login"));
const Logout = React.lazy(() => import("../pages/auth/Logout"));
const Location = React.lazy(() => import("../pages/location"));
const Legal = React.lazy(() => import("../pages/legal"));
const Contacts = React.lazy(() => import("../pages/contacts"));
const News = React.lazy(() => import("../pages/news"));
const Admin = React.lazy(() => import("../pages/admin"));
const Gift = React.lazy(() => import("../pages/gift"));
const Users = React.lazy(() => import("../pages/users"));
const Banner = React.lazy(() => import("../pages/banner"))
const Karting = React.lazy(() => import("../pages/karting"))
const Booking1 = React.lazy(() => import("../pages/bookings/booking1"))
const Bowling = React.lazy(() => import("../pages/bowling"))
const BookingTable = React.lazy(() => import("../pages/bookings/bookingsTable"))
const EventsPage = React.lazy(() => import("../pages/events"))
const QuestsPage = React.lazy(() => import("../pages/quest"))
const RestaurantMenu = React.lazy(() => import("../pages/restaurantMenu"))
const OperationMode = React.lazy(() => import("../pages/operationMode"))
const ImagesPage = React.lazy(() => import("../pages/images"))

const switchLocation = (location: string) => {
  switch (location) {
    case "karting":
      return <Karting />
    case "bowling":
      return <Bowling />
    case "cozy_cafe":
      return <BookingTable />
    case "family_cafe":
      return <BookingTable />
    default :
      return <Booking1 />
  }
}


export interface RoutesProps {
  path: RouteProps["path"];
  name?: string;
  element?: RouteProps["element"];
  route?: typeof Route;
  exact?: boolean;
  icon?: string;
  header?: string;
  roles?: string[];
  children?: RoutesProps[];
}

const generateLocationRoutes = (locations: ILocationsGetData[]) => {
  return locations.map(location => ({
    path: `/location/${location.code}`,
    name: location.name,
    icon: "grid",
    header: "Location",
    element: switchLocation(location.code),
    route: Route
  }));
};

const locationRoute: RoutesProps = {
  path: "/location",
  name: "Location",
  icon: "grid",
  element: <Location />,
  route: Route
}

const adminRoute: RoutesProps = {
  path: "/administrators",
  name: 'Admin',
  element: <Admin />,
  route: Route
}

const usersRoute: RoutesProps = {
  path: "/users",
  name: "Users",
  element: <Users />,
  route: Route
}

const newsRoute: RoutesProps = {
  path: "/news",
  name: 'News',
  element: <News />,
  route: Route
}

const contactsRoute: RoutesProps = {
  path: "/contacts",
  name: 'Contacts',
  element: <Contacts />,
  route: Route
}

const bannersRoute: RoutesProps = {
  path: "/banners",
  name: 'Banners',
  element: <Banner />,
  route: Route
}

const giftRoute: RoutesProps = {
  path: "/gift",
  name: "Gift",
  element: <Gift />,
  route: Route
}

const legalRoute: RoutesProps = {
  path: "/legal",
  name: "Legal",
  element: <Legal />,
  route: Route
}

const eventsRoute: RoutesProps = {
  path: "/events",
  name: "Events",
  element: <EventsPage />,
  route: Route
}

const questsRoute: RoutesProps = {
  path: "/quests",
  name: "Quests",
  element: <QuestsPage />,
  route: Route
}

const restaurantMenuRoute: RoutesProps = {
  path: "/restaurant-menu",
  name: "RestaurantMenu",
  element: <RestaurantMenu />,
  route: Route
}

const operationModeRoute: RoutesProps = {
  path: "/operation-mode",
  name: "OperationMode",
  element: <OperationMode />,
  route: Route
}

const imagesRoute: RoutesProps = {
  path: "/images",
  name: "Images",
  element: <ImagesPage />,
  route: Route
}


const dashboardRoutes: RoutesProps[] = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/location"/>,
    route: Route
  },
  locationRoute
]

const superAdminAfterLocationRoute: RoutesProps[] = [
  eventsRoute, questsRoute, adminRoute, usersRoute, restaurantMenuRoute, newsRoute, operationModeRoute, imagesRoute,contactsRoute, bannersRoute, giftRoute, legalRoute
]

const adminAfterLocationRoute: RoutesProps[] = superAdminAfterLocationRoute.filter(route => route.name !== "Admin")

const managerAfterLocationRoute: RoutesProps[] = [
  usersRoute, giftRoute
]

const contentManagerRoute: RoutesProps[] = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/news"/>,
    route: Route
  },
  {
    path: "/location",
    name: "Root",
    element: <Navigate to="/news"/>,
    route: Route
  },
  eventsRoute, questsRoute, usersRoute, newsRoute, operationModeRoute, imagesRoute, restaurantMenuRoute, contactsRoute, bannersRoute, giftRoute, legalRoute
]

const authRoutes: RoutesProps[]= [
  {
    path: "/auth/login",
    name: "Login",
    element: <Login />,
    route: Route,
  },
  {
    path: "/auth/logout",
    name: "Logout",
    element: <Logout />,
    route: Route
  }
]

const flattenRoutes = (routes: RoutesProps[]) => {
  let flatRoutes:RoutesProps[] = []

  routes = routes || [];

  routes.forEach(item => {
    flatRoutes.push(item)

    if (typeof item.children !== "undefined") {
      flatRoutes = [...flatRoutes, ...flattenRoutes(item.children)]
    }

  })
  return flatRoutes
}

const publicRoutes = [...authRoutes]

const publicProtectedFlattenRoutes = flattenRoutes([...publicRoutes])


export {
  publicRoutes,
  publicProtectedFlattenRoutes,
  generateLocationRoutes,
  flattenRoutes,
  dashboardRoutes,
  superAdminAfterLocationRoute,
  adminAfterLocationRoute,
  managerAfterLocationRoute,
  contentManagerRoute,
}