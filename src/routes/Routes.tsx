import {Route, Routes, Navigate} from "react-router-dom";
import {
  adminAfterLocationRoute,
  contentManagerRoute, dashboardRoutes,
  flattenRoutes, generateLocationRoutes, managerAfterLocationRoute,
  publicProtectedFlattenRoutes, RoutesProps, superAdminAfterLocationRoute
} from "./index.tsx";
import DefaultLayout from "../layouts/Default.tsx";
import {$token} from "../store/token.ts";
import {useUnit} from "effector-react";
import VerticalLayout from "../layouts/Vertical.tsx";
import "../helpers/api/authConfig.ts"
import {$locationsStore} from "../store/location/getLocations.ts";
import {$adminProfileStore} from "../store/admin/getAdmin.ts";
import {useEffect, useState} from "react";

const AllRoutes = () => {
  const [token, admin, location] = useUnit([$token, $adminProfileStore, $locationsStore])
  const [routes, setRoutes] = useState<RoutesProps[]>([])

  useEffect(() => {
    switch (admin?.roles[0].name) {
      case "Супер-Администратор":
        setRoutes(flattenRoutes([
          ...dashboardRoutes,
          ...generateLocationRoutes(location),
          ...superAdminAfterLocationRoute
        ]))
        break;
      case "Администратор":
        setRoutes(flattenRoutes([
          ...dashboardRoutes,
          ...generateLocationRoutes(location),
          ...adminAfterLocationRoute
        ]))
        break;
      case "Менеджер":
        setRoutes(flattenRoutes([
          ...dashboardRoutes,
          ...generateLocationRoutes(admin?.access_location && admin.access_location.length === 0 ? location : admin.access_location),
          ...managerAfterLocationRoute
        ]))
        break;
      case "Маркетолог":
        setRoutes(flattenRoutes([...contentManagerRoute]))
        break;
    }

  }, [admin, location]);



  return (
    <Routes>
      <Route path="/" element={
        !token ? (
          <Navigate to="/auth/login" />
        ) : (
          <Navigate to="/location" />
        )
      } />
      <Route>
        {publicProtectedFlattenRoutes.map((route, idx) => (
          <Route path={route.path}
                 element={
                   <DefaultLayout>
                     {route.element}
                   </DefaultLayout>
                 }
                 key={route.path + `${idx}` + route.name}
          />
        ))}
      </Route>
      <Route>
        {routes.map((route, idx) => (
          <Route path={route.path}
                 element={
                   token.length >= 1 ? (
                     <VerticalLayout>{route.element}</VerticalLayout>
                   ) : (
                     <Navigate to={{
                       pathname: "/auth/login",
                       search: "next=" + route.path
                     }} />
                   )
                 }
                 key={route.path + `${idx}` + route.name}
          />
        ))}
      </Route>
    </Routes>
  );
}

export default AllRoutes;