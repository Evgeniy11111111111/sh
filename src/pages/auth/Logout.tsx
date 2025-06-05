import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

//actions

// components
import AuthLayout from "./AuthLayout";
import {useEffect} from "react";
import {resetToken} from "../../store/token.ts";

const LogoutIcon = () => {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2" > <circle className="path circle" fill="none" stroke="#4bd396" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" /> <polyline className="path check" fill="none" stroke="#4bd396" strokeWidth="6" strokeLinecap="round" strokeMiterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 " /> </svg>
  );
};

/* bottom link */
const BottomLink = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer footer-alt">
      <p className="text-muted">
        {t("Вернуться к ")}{" "}
        <Link to={"/auth/login"} className="text-muted ms-1">
          <b>{t("Входу в систему")}</b>
        </Link>
      </p>
    </footer>
  );
};

const Logout = () => {
  const { t } = useTranslation();

  useEffect(() => {
    resetToken()
  }, []);

  return (
    <>
      <AuthLayout bottomLinks={<BottomLink />}>
        <div className="text-center">
          <div className="mt-4">
            <div className="logout-checkmark">
              <LogoutIcon />
            </div>
          </div>

          <h3>{t("Увидимся снова !")}</h3>

          <p className="text-muted">
            {" "}
            {t("Вы успешно вышли из системы.")}{" "}
          </p>
        </div>
      </AuthLayout>
    </>
  );
};

export default Logout;
