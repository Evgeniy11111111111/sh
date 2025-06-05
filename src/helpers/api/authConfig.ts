import {$token} from "../../store/token.ts";
import axios from "axios";

axios.defaults.headers.post["Content-Type"] = "application/json";

export const setAuthorization = (token: string | null) => {
  if (token) axios.defaults.headers.common["Authorization"] = "Bearer " + token;
  else delete axios.defaults.headers.common["Authorization"];
};

$token.watch((token) => {
  if (token.length > 1) {
    setAuthorization(token);
  }
});