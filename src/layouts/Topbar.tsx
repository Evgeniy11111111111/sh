import React from "react";
import {Link} from "react-router-dom";

import ProfileDropdown from "../components/ProfileDropdown";

import profilePic from "../assets/images/users/user-1.jpg";
import logoSm from "../assets/images/logo-mini.svg";
import logoDark from "../assets/images/logo-big.svg";
import logoLight from "../assets/images/logo-big.svg";
import {useViewport} from "../hooks/useViewPort";
import {useUnit} from "effector-react";
import {$leftSidebarType, ELeftSidebar, leftSidebarChangeType} from "../store/layout/layout.ts";
import {$adminProfileStore} from "../store/admin/getAdmin.ts";


const ProfileMenus = [
  {
    label: "Выйти",
    icon: "fe-log-out",
    redirectTo: "/auth/logout",
  },
];

interface TopbarProps {
  hideLogo?: boolean;
  navCssClasses?: string;
}

const Topbar = ({
                  hideLogo,
                  navCssClasses,
                }: TopbarProps) => {
  const { width } = useViewport();
  const [leftSidebar, admin] = useUnit([$leftSidebarType, $adminProfileStore])

  const navbarCssClasses: string = navCssClasses || "";
  const containerCssClasses: string = !hideLogo ? "container-fluid" : "";


  /**
   * Toggle the leftmenu when having mobile screen
   */
  const handleLeftMenuCallBack = () => {
    if (width < 1140) {
      if (leftSidebar === 'full') {
        showLeftSideBarBackdrop();
        document.getElementsByTagName("html")[0].classList.add("sidebar-enable");
      }
      else {
        leftSidebarChangeType(ELeftSidebar.full)
      }
    } else if (leftSidebar === "condensed") {
      leftSidebarChangeType(ELeftSidebar.default)
    } else if (leftSidebar === 'full') {
      showLeftSideBarBackdrop();
      document.getElementsByTagName("html")[0].classList.add("sidebar-enable");
    } else if (leftSidebar === 'fullscreen') {
      leftSidebarChangeType(ELeftSidebar.default)
      document.getElementsByTagName("html")[0].classList.add("sidebar-enable");
    }
    else {
      leftSidebarChangeType(ELeftSidebar.condensed)
    }
  };

  // create backdrop for leftsidebar
  function showLeftSideBarBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.id = "custom-backdrop";
    backdrop.className = "offcanvas-backdrop fade show";
    // backdrop.style.zIndex = '999'
    document.body.appendChild(backdrop);

    if (
      document.getElementsByTagName("html")[0]?.getAttribute("dir") !== "rtl"
    ) {
      document.body.style.overflow = "hidden";
      if (width > 1140) {
        document.body.style.paddingRight = "15px";
      }
    }

    backdrop.addEventListener("click", function () {
      document.getElementsByTagName("html")[0].classList.remove("sidebar-enable");
      // dispatch(changeSidebarType(SideBarTypes.LEFT_SIDEBAR_TYPE_FULL));
      hideLeftSideBarBackdrop();
    });
  }

  function hideLeftSideBarBackdrop() {
    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = "visible";
    }
  }

  return (
    <React.Fragment>
      <div className={`navbar-custom ${navbarCssClasses}`}>
        <div className={`topbar ${containerCssClasses}`}>
          <div className="topbar-menu d-flex align-items-center gap-1">
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

            <button
              className="button-toggle-menu"
              onClick={handleLeftMenuCallBack}
            >
              <i className="mdi mdi-menu" />
            </button>
          </div>

          <ul className="topbar-menu d-flex align-items-center">
            <li className="dropdown">
              <ProfileDropdown
                profilePic={profilePic}
                menuItems={ProfileMenus}
                username={admin?.fio || 'Админ'}
                userTitle={"Founder"}
              />
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Topbar;
