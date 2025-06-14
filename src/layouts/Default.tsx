import {Suspense, useEffect} from "react";
// import {changeHTMLAttribute} from "../utils"

const loading = () => <div className=""></div>;

interface DefaultLayoutProps {
  // layout: {
  //   layoutType: string;
  //   layoutWidth: string;
  //   leftSideBarTheme: string;
  //   leftSideBarType: string;
  //   showRightSidebar: boolean;
  // };
  children?: any;
}

const DefaultLayout = (props: DefaultLayoutProps) => {


  useEffect(() => {

    if (document.body)
      document.body.classList.add(
        "authentication-bg",
        "authentication-bg-pattern"
      );

    return () => {
      if (document.body)
        document.body.classList.remove(
          "authentication-bg",
          "authentication-bg-pattern"
        );
    };
  }, []);

  // get the child view which we would like to render
  const children = props["children"] || null;

  return (
    <>
      <Suspense fallback={loading()}>{children}</Suspense>
    </>
  );
};
export default DefaultLayout;
