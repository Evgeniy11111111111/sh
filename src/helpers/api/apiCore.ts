import axios from "axios";
import {$token} from "../../store/token.ts";

const getUserFromCookie = () => {
  const token = $token.getState()
  return token.length >= 1
}

class ApiCore {
  contentTypeMultipart = () => {
    axios.defaults.headers.post["Content-Type"] = 'multipart/form-data'
  }

  contentTypeJson = () => {
    axios.defaults.headers.post["Content-Type"] = "application/json";
  }

  get = async (url: string) => {
    return await axios.get(url)
  }

  create = async <T>(url: string, data: T) => {
    try {
      const response = await axios.post(url, data)
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        if (status === 422) {
          throw new Error("Неправильный логин или пароль")
        } else if (status === 404) {
          throw new Error("Ошибка")
        } else if (status === 500) {
          throw new Error("Ошибка обращения к сервису")
        }
      }
    }
  }

  post = async <T>(url: string, data: T) => {
    try {
      const response = await axios.post(url, data)
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw err.response
      } else {
        throw err
      }
    }
  }

  remove = async (url: string) => {
    await axios.delete(url)
  }

  isUserAuthenticated () {
    return getUserFromCookie()
  }
}

export {ApiCore}