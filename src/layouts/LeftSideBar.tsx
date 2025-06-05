import React, {useEffect, useRef, useState} from "react";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";

// constants

// components
import AppMenu from "./Menu";

import logoSm from "../assets/images/logo-mini.svg";
import logoDark from "../assets/images/logo-big.svg";
import logoLight from "../assets/images/logo-big.svg";
import {
  MenuItemTypes,
  MENU_LOCATION,
  MENU_SUPER_ADMIN_AFTER_LOCATIONS,
  MENU_ADMIN_AFTER_LOCATIONS,
  MENU_MANAGER_AFTER_LOCATIONS,
  MENU_CONTENT_MANAGER_AFTER_LOCATIONS
} from "../constants/menu.ts";
import {useUnit} from "effector-react";
import {$locationsStore} from "../store/location/getLocations.ts";
import {$adminProfileStore} from "../store/admin/getAdmin.ts";
import {generationItemForMenu} from "../utils";
import classNames from "classnames";
/* sidebar content */
const SideBarContent = () => {
  const [locations, admin] = useUnit([$locationsStore, $adminProfileStore])
  const [menu, setMenu] = useState<MenuItemTypes[]>([])

  useEffect(() => {
    switch (admin?.roles[0].name) {
      case "Супер-Администратор":
        setMenu([
          MENU_LOCATION,
          ...generationItemForMenu(locations),
          ...MENU_SUPER_ADMIN_AFTER_LOCATIONS
        ])
        break;
      case "Администратор":
        setMenu([
          MENU_LOCATION,
          ...generationItemForMenu(locations),
          ...MENU_ADMIN_AFTER_LOCATIONS
        ])
        break;
      case "Менеджер":
        setMenu([
          MENU_LOCATION,
          ...generationItemForMenu(admin?.access_location ? admin.access_location : locations),
          ...MENU_MANAGER_AFTER_LOCATIONS
        ])
        break;
      case "Маркетолог":
        setMenu([...MENU_CONTENT_MANAGER_AFTER_LOCATIONS])
        break;
    }
  }, [admin, locations]);


  return (
    <>
      {/*<UserBox />*/}

      {/* <div id="sidebar-menu"> */}
      <AppMenu menuItems={menu} />
      {/* </div> */}

      <div className="clearfix" />
    </>
  );
};

interface LeftSidebarProps {
  isCondensed: boolean;
  hideLogo?: boolean;
}

const LeftSidebar = ({ isCondensed = false, hideLogo }: LeftSidebarProps) => {
  const menuNodeRef: any = useRef(null);

  // const { layoutType } = useSelector((state: RootState) => ({
  //   layoutType: state.Layout.layoutType,
  //   leftSideBarType: state.Layout.leftSideBarType,
  // }));

  /**
   * Handle the click anywhere in doc
   */
  const handleOtherClick = (e: any) => {
    if (
      menuNodeRef &&
      menuNodeRef.current &&
      menuNodeRef.current.contains(e.target)
    )
      return;
    // else hide the menubar
    if (document.body) {
      document.body.classList.remove("sidebar-enable");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOtherClick, false);

    return () => {
      document.removeEventListener("mousedown", handleOtherClick, false);
    };
  }, []);

  return (
    <React.Fragment>
      <div className={classNames("app-menu")} ref={menuNodeRef}>
        {!hideLogo && (
          <div className="logo-box">
            <Link to="/" className="logo logo-dark text-center">
              <span className="logo-sm">
                <img src={logoSm} alt="" height="22" />
              </span>
              <span className="logo-lg">
                <img
                  src={logoDark}
                  alt=""
                  height="20"
                />
              </span>
            </Link>
            <Link to="/" className="logo logo-light text-center">
              <span className="logo-sm">
                <img src={logoSm} alt="" height="22" />
              </span>
              <span className="logo-lg">
                <img
                  src={logoLight}
                  alt=""
                  height="20"
                />
              </span>
            </Link>
          </div>
        )}

        {!isCondensed && (
          <SimpleBar
            className="scrollbar show h-100"
            // style={{ maxHeight: '100%' }}
            // timeout={500}
            scrollbarMaxSize={320}
          >
            <SideBarContent />
          </SimpleBar>
        )}
        {isCondensed && <SideBarContent />}
      </div>
    </React.Fragment>
  );
};

export default LeftSidebar;
