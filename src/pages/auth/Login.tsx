import {Alert, Button} from "react-bootstrap"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup";
import AuthLayout from "./AuthLayout.tsx";
import VerticalForm from "../../components/VerticalForm.tsx";
import FormInput from "../../components/FormInput.tsx";
import {
  $authPostError,
  $authPostLoading,
  authResetLogin,
  fxAuthPost
} from "../../store/auth/postAuth.ts";
import {useUnit} from "effector-react";
import {$token} from "../../store/token.ts";
import {Navigate, useLocation} from "react-router-dom";
interface UserData {
  email: string;
  password: string;
}
const Login = () => {
  const [error, loading] = useUnit([$authPostError, $authPostLoading])
  const token = useUnit($token)
  const schemaResolver = yupResolver(
    yup.object().shape({
      email: yup.string().required("Введите адрес почты"),
      password: yup.string().required("Введите пароль"),
    })
  );
  const onSubmit = (formData: UserData) => {
    authResetLogin();
    fxAuthPost({email: formData["email"], password: formData["password"]})
  };

  const location = useLocation();
  //
  // const redirectUrl = location.state && location.state.from ? location.state.from.pathname : '/';
  const redirectUrl = location?.search?.slice(6) || "/";

  return (
    <>
      {(token.length > 0) && <Navigate to={redirectUrl}></Navigate>}

      <AuthLayout>
        <h4 className="mt-0">Войти</h4>
        <p className="text-muted mb-4">
          Введите адрес электронной почты и пароль для доступа к учетной записи.
        </p>

        {error && (
          <Alert variant="danger" className="my-2">
            {error}
          </Alert>
        )}

        <VerticalForm
          onSubmit={onSubmit}
          resolver={schemaResolver}
        >
          <FormInput
            label={"E-mail"}
            type="email"
            name="email"
            placeholder={"Введите e-mail"}
            containerClass={"mb-3"}
          />
          <FormInput
            label={"Пароль"}
            type="password"
            name="password"
            placeholder={"Введите пароль"}
            containerClass={"mb-3"}
          >
          </FormInput>

          <div className="d-grid mb-0 text-center">
            <Button variant="primary" type="submit" disabled={loading}>
              {"Войти"}
            </Button>
          </div>
        </VerticalForm>
      </AuthLayout>
    </>
  );
};

export default Login;
