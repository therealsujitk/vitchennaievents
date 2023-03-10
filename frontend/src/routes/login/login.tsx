import { DialogContent, Link, Stack, Typography } from "@mui/material";
import React from "react";
import { Button, Dialog, DialogTitle, TextField } from "../../components";
import { AppContext } from "../../contexts/app";
import Network from "../../utils/network";
import './main.css';

interface LoginState {
  isLoading: boolean;
  errorMessage?: string;
}

export default class Login extends React.Component<{}, LoginState> {
  usernameInput: React.RefObject<HTMLInputElement>;
  passwordInput: React.RefObject<HTMLInputElement>;

  constructor(props: {}) {
    super(props);

    this.state = {
      isLoading: false,
    };

    this.usernameInput = React.createRef();
    this.passwordInput = React.createRef();

    this.signIn.bind(this);
  }

  componentWillMount() {
    document.body.classList.add('login');
  }

  componentWillUnmount() {
    document.body.classList.remove('login');
  }

  render() {
    require('./main.css');

    return (
      <Dialog open={true}>
        <DialogTitle>Sign In</DialogTitle>
        <DialogContent>
        <AppContext.Consumer>
          {({ initSession, setSession }) => (
            <Stack spacing={1} mt={0.5} mb={1}>
              <TextField inputRef={this.usernameInput} inputProps={{ onKeyDown: this.handleEnter() }} placeholder="Username" name="username" type="text" variant="outlined" disabled={this.state.isLoading} centerAlign autoFocus />
              <TextField inputRef={this.passwordInput} inputProps={{ onKeyDown: this.handleEnter(initSession) }} placeholder="Password" name="password" type="password" variant="outlined" disabled={this.state.isLoading} centerAlign />
              { this.state.errorMessage && <Typography sx={{ textAlign: 'center', fontSize: 14, color: 'red' }} pt={0.5} variant="subtitle2">{this.state.errorMessage}</Typography> }
              <Button variant="contained" sx={(theme) => ({ mt: `${theme.spacing(2)} !important` })} isLoading={this.state.isLoading} onClick={() => this.signIn(initSession)}>Sign In</Button>
              <Typography sx={{ textAlign: 'center' }} pt={1} variant="subtitle2">
                Register at <Link href="https://vitchennaievents.com/vibrance" underline="none" target="_blank">VIT Chennai Events</Link>.
              </Typography>
            </Stack>
          )}
          </AppContext.Consumer>
        </DialogContent>
      </Dialog>
    );
  }

  async signIn(initSession: (username: string, password: string) => void) {
    this.setErrorMessage();
    this.setLoading(true);

    const credentials = {
      'x-username': this.usernameInput.current?.value,
      'x-password': this.passwordInput.current?.value,
    };

    try {
      await new Network().doPost('/profile/api/latest/user/login', { headers: credentials, body: {} });
      initSession(credentials["x-username"]!, credentials["x-password"]!);
    } catch (err) {
      this.setErrorMessage(err as string);
    }

    this.setLoading(false);
  }

  setErrorMessage = (errorMessage?: string) => {
    this.setState({ errorMessage: errorMessage });
  }

  setLoading = (isLoading : boolean) => {
    this.setState({ isLoading: isLoading });
  }

  handleEnter = (initSession?: (username: string, password: string) => void) => (event : React.KeyboardEvent) => {
    if (event.key != 'Enter') {
      return;
    }

    const inputName = event.currentTarget.getAttribute("name");

    if (inputName == 'username') {
      this.passwordInput.current?.focus();
    } else if (inputName == 'password') {
      this.signIn(initSession!);
    }
  }
}
