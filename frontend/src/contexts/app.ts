import { AlertColor } from "@mui/material";
import { createContext } from "react"

export interface AppContextInterface {
  username?: string,
  password?: string,
  userId?: string,
  name?: string,
  email?: string,
  mobile?: string,
  college?: string,
  initSession: (username: string, passsword: string) => void,
  setSession: (userId: string, name: string, email: string, mobile: string, college: string) => void,
  destroySession: () => void,
  displayAlert: (type: AlertColor, message: Error|string, action?: { name: string, onClick: () => void }) => void,
  displayError: (message: Error|string, action?: { name: string, onClick: () => void }) => void,
  displayWarning: (message: string) => void,
  displaySuccess: (message: string) => void
}

export const AppContext = createContext<AppContextInterface>(undefined!);
