import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import classNames from "classnames";

interface ProfileMenuItem {
  label: string;
  icon: string;
  redirectTo: string;
}

interface ProfileDropdownProps {
  menuItems: Array<ProfileMenuItem>;
  profilePic?: string;
  username: string;
  userTitle?: string;
}

const ProfileDropdown = (props: ProfileDropdownProps) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  /*
   * toggle profile-dropdown
   */
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
      <Dropdown.Toggle
        id="dropdown-profile"
        as="a"
        onClick={toggleDropdown}
        className={classNames(
          "nav-link nav-user me-0 waves-effect waves-light",
          { show: dropdownOpen }
        )}
      >
        <div style={{width: '25px', height: '25px', color: "black"}} className="rounded-circle d-flex align-items-center justify-content-center bg-secondary-subtle" >
          {props.username[0]}
        </div>
        <span className="pro-user-name ms-1">
          {props.username} <i className="mdi mdi-chevron-down"></i>
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-end profile-dropdown">
        <div onClick={toggleDropdown}>
          <div className="dropdown-header noti-title">
            <h6 className="text-overflow m-0">Добро пожаловать !</h6>
          </div>
          {(props.menuItems || []).map((item, i) => {
            return (
              <React.Fragment key={i}>
                {i === props["menuItems"].length - 1 && (
                  <div className="dropdown-divider"></div>
                )}
                <Link
                  to={item.redirectTo}
                  className="dropdown-item notify-item"
                  key={i + "-profile-menu"}
                >
                  <i className={`${item.icon} me-1`}></i>
                  <span>{item.label}</span>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
