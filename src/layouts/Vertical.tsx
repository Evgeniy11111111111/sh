import React, {Suspense, useEffect} from "react";
import {Container} from "react-bootstrap";

import {useViewport} from "../hooks/useViewPort";
import {changeHTMLAttribute} from "../utils";
import {useUnit} from "effector-react/effector-react.umd";
import {$leftSidebarType, ELeftSidebar, leftSidebarChangeType} from "../store/layout/layout.ts";

const Topbar = React.lazy(() => import("./Topbar"));
const LeftSidebar = React.lazy(() => import("./LeftSideBar"));

const loading = () => <div className=""></div>;

interface VerticalLayoutProps {
  children?: React.ReactNode;
}

const VerticalLayout = ({ children }: VerticalLayoutProps) => {
  const { width } = useViewport();
  const [leftSidebar] = useUnit([$leftSidebarType]);


  useEffect(() => {
    if (width < 1140) {
      leftSidebarChangeType(ELeftSidebar.full)
    } else if (width >= 1140) {
      leftSidebarChangeType(ELeftSidebar.default)
      document
        .getElementsByTagName("html")[0]
        .classList.remove("sidebar-enable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);
  useEffect(() => {
    changeHTMLAttribute("data-layout", "vertical");
  }, []);
  useEffect(() => {
    changeHTMLAttribute("data-layout-mode", "detached");
  }, []);
  useEffect(() => {
    changeHTMLAttribute("data-layout-width", "fluid");
  }, []);
  useEffect(() => {
    changeHTMLAttribute("data-bs-theme", "light");
  }, []);
  useEffect(() => {
    changeHTMLAttribute("data-menu-color", "dark");
  }, []);
  useEffect(() => {
    changeHTMLAttribute("data-sidenav-size", leftSidebar);
  }, [leftSidebar]);
  useEffect(() => {
    changeHTMLAttribute("data-topbar-color", "dark");
  }, []);

  /**
   * Open the menu when having mobile screen
   */
  //
  const isCondensed: boolean =
    leftSidebar === ELeftSidebar.condensed;

  return (
    <>
      <div id="wrapper">
        <Suspense fallback={loading()}>
          <LeftSidebar isCondensed={isCondensed} hideLogo={false} />
        </Suspense>

        <div className="content-page">
          <Suspense fallback={loading()}>
            <Topbar />
          </Suspense>

          <div className="content">
            <Container fluid>
              <Suspense fallback={loading()}>{children}</Suspense>
            </Container>
          </div>
        </div>
      </div>
    </>
  );
};
export default VerticalLayout;
