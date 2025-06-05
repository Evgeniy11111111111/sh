import AllRoutes from "./routes/Routes.tsx";
import {BrowserRouter} from "react-router-dom";
import {useEffect} from "react";
import {locationsGetFx} from "./store/location/getLocations.ts";
import {useUnit} from "effector-react";
import {$token} from "./store/token.ts";
import {adminProfileGetFx} from "./store/admin/getAdmin.ts";
function App() {
  const [token] = useUnit([$token])

  useEffect(() => {
    if (token) {
      adminProfileGetFx().then(() => {
        locationsGetFx()
      })
    }
  }, [token]);
  return (
    <>
      <BrowserRouter>
        <AllRoutes/>
      </BrowserRouter>
    </>
  )
}

export default App
