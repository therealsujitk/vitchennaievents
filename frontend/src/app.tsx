import { Home, Login } from "./routes";
import { BrowserRouter } from "react-router-dom";
import { DarkTheme } from "./theme";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Stack,
  ThemeProvider,
} from "@mui/material";
import { AppContext, AppContextInterface } from "./contexts/app";
import Logo from "./assets/images/logo.png";
import React from "react";
import Cookies from "js-cookie";
import { CircularProgress, CssBaseline, Typography } from "@mui/material";
import Network from "./utils/network";
import { MediaQuery } from "./components";

interface AppState {
  username?: string;
  password?: string;
  userId?: string;
  name?: string;
  email?: string;
  mobile?: string;
  college?: string;
  alerts: {
    [x: string]: {
      type: AlertColor;
      message: string;
      action?: {
        name: string;
        onClick: () => void;
      };
    };
  };
}

export default class App extends React.Component<{}, AppState> {
  isSessionCalled: boolean;

  constructor(props: AppState) {
    super(props);

    this.state = {
      username: Cookies.get("username"),
      password: Cookies.get("password"),
      alerts: {},
    };

    this.isSessionCalled = false;
  }

  render() {
    const appContext: AppContextInterface = {
      userId: this.state.userId,
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      email: this.state.email,
      mobile: this.state.mobile,
      college: this.state.college,
      initSession: (username, password) => {
        Cookies.set("username", username, { expires: 7, path: "/profile" });
        Cookies.set("password", password, { expires: 7, path: "/profile" });
        this.setState({ 
          username: username, 
          password: password,
        });
      },
      setSession: (userId, name, email, mobile, college) => {
        this.setState({
          userId: userId,
          name: name,
          email: email,
          mobile: mobile,
          college: college,
        });
      },
      destroySession: () => {
        Cookies.remove("username", { path: "/profile" });
        Cookies.remove("password", { path: "/profile" });
        this.setState({
          username: undefined,
          password: undefined,
          userId: undefined,
        });

        this.isSessionCalled = false;
      },
      displayAlert: (
        type: AlertColor,
        message: string | Error,
        action?: { name: string; onClick: () => void }
      ) => {
        var alertId = Math.random();

        while (alertId in this.state.alerts) {
          alertId = Math.random();
        }

        this.state.alerts[alertId] = {
          type: type,
          message: message.toString(),
          action: action,
        };

        this.setState({ alerts: this.state.alerts });
      },
      displayError: (
        message: string | Error,
        action?: { name: string; onClick: () => void }
      ) => {
        if (message.toString().toLowerCase().includes("account") || message.toString().toLowerCase().includes("incorrect")) {
          action = {
            name: "Sign In",
            onClick: () => appContext.destroySession(),
          };
        }

        appContext.displayAlert("error", message, action);
      },
      displayWarning: (message: string) => {
        appContext.displayAlert("warning", message);
      },
      displaySuccess: (message: string) => {
        appContext.displayAlert("success", message);
      },
    };

    const Splash = () => (
      <div>
        <CssBaseline />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "100%",
          }}
        >
          <img
            style={{ width: "min(300px, 80%)", padding: "20px" }}
            src={Logo}
          />
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              paddingTop: 0,
            }}
          >
            <CircularProgress sx={{ marginRight: 2 }} size={24} />
            Dashboard is loading...
          </Typography>
        </div>
      </div>
    );

    return (
      <ThemeProvider theme={DarkTheme}>
        <AppContext.Provider value={appContext}>
          <BrowserRouter basename="/profile">
            <AppContext.Consumer>
              {({ username, password, userId, setSession, displayError }) => {
                if (!username) {
                  return <Login />;
                } else if (!userId) {
                  if (!this.isSessionCalled) {
                    this.isSessionCalled = true;
                    this.getSession(username, password!, setSession, displayError);
                  }

                  return <Splash />;
                } else {
                  return <Home />;
                }
              }}
            </AppContext.Consumer>
          </BrowserRouter>
        </AppContext.Provider>
        {Object.keys(this.state.alerts).length !== 0 && (
          <MediaQuery query={(theme) => theme.breakpoints.up("sm")}>
            {(theme) => (
              <Stack
                sx={{
                  position: "fixed",
                  left: 0,
                  bottom: 0,
                  padding: 2,
                  zIndex: 1500,
                  width: theme ? "400px" : "100%",
                }}
                spacing={1.5}
              >
                {Object.entries(this.state.alerts).map(([k, v]) => (
                  <Alert
                    key={k}
                    severity={v.type}
                    onClose={() => {
                      delete this.state.alerts[k];
                      this.setState({ alerts: this.state.alerts });
                    }}
                    {...(v.action
                      ? {
                          action: (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                height: "100%",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <Button
                                color="inherit"
                                onClick={() => {
                                  delete this.state.alerts[k];
                                  this.setState({ alerts: this.state.alerts });
                                  v.action!.onClick();
                                }}
                              >
                                {v.action.name}
                              </Button>
                            </Box>
                          ),
                        }
                      : {})}
                  >
                    <strong>
                      {v.type.charAt(0).toUpperCase() + v.type.slice(1)} —
                    </strong>{" "}
                    {v.message}
                  </Alert>
                ))}
              </Stack>
            )}
          </MediaQuery>
        )}
      </ThemeProvider>
    );
  }

  getSession = async (
    username: string,
    password: string,
    setSession: AppContextInterface['setSession'],
    onError: AppContextInterface['displayError']
  ) => {
    try {
      const credentials = {
        'x-username': username,
        'x-password': password,
      };

      const response = await new Network().doPost("/api/latest/user/login", { headers: credentials, body: {} });
      
      const userId = response.user.id;
      const name = response.user.name;
      const email = response.user.email;
      const mobile = response.user.mobile;
      const college = response.user.college;

      setSession(userId, name, email, mobile, college);
    } catch (err: any) {
      onError(err, {
        name: "Retry",
        onClick: () => this.getSession(username, password, setSession, onError),
      });
    }
  };
}
