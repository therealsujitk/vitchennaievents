import { AccountCircleOutlined, Edit, Logout, Person } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { AppBar as MaterialAppBar, Box, Button as MaterialButton, Checkbox, DialogContent, FormControlLabel, Grid, IconButton, Link, Menu, MenuItem, Stack, Toolbar, Typography } from "@mui/material";
import Cookies from "js-cookie";
import React from "react";
import { Button, Dialog, DialogTitle, MediaQuery, TextField } from "../../components";
import { AppContext, AppContextInterface } from "../../contexts/app";
import Network from "../../utils/network";

interface AppBarProps {
  /**
   * The title to be displayed in the app bar
   * @default 'Vibrance Dashboard'
   */
  title: string;

  /**
   * If `false` the menu icon will be hidden
   * @default true
   */
  showMenuIcon: boolean;

  /**
   * OnClick listener for the menu icon
   */
  onMenuClick: () => void;
}

interface AppBarState {
  /**
   *
   */
  isSignOutDialogOpen: boolean;

  /**
   * 
   */
  isProfileDialogOpen: boolean;
}

export default class AppBar extends React.Component<AppBarProps, AppBarState> {
  static defaultProps : Partial<AppBarProps> = {
    title: 'Vibrance Profile',
  };

  static items = {
    editProfile: {
      title: "View Profile",
      icon: <Person />,
      onClick: () => {}
    },
    signOut: {
      title: "Sign Out",
      icon: <Logout />,
      onClick: () => {}
    }
  };

  apiKey: string;

  constructor(props: AppBarProps) {
    super(props);

    this.state = {
      isSignOutDialogOpen: false,
      isProfileDialogOpen: false
    };

    this.apiKey = Cookies.get('apiKey')!;
  }

  render() {
    const SignOutDialog = () => (
      <Dialog onClose={this.closeSignOutDialog} open={this.state.isSignOutDialogOpen || false}>
        <DialogTitle onClose={this.closeSignOutDialog}>Sign Out</DialogTitle>
        <DialogContent>
          <Stack spacing={1} mt={0.5}>
            <Typography>Are you sure you want to sign out?</Typography>
            <AppContext.Consumer>
              {({ destroySession }) => (
                <Button variant="contained" onClick={() => this.signOut(destroySession)}>Yes, I'm sure</Button>
              )}
            </AppContext.Consumer>
          </Stack>
        </DialogContent>
      </Dialog>
    )

    const profileItems = AppBar.items;
    profileItems.signOut.onClick = () => this.openSignOutDialog();
    profileItems.editProfile.onClick = () => this.openProfileDialog();

    return (
      <>
        <MaterialAppBar position="fixed" sx={{zIndex: 1300}} enableColorOnDark>
          <Toolbar>
            {this.props.showMenuIcon && <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 1 }}
              onClick={() => this.props.onMenuClick()}
            >
              <MenuIcon />
            </IconButton>}
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1, color: 'black' }}>
              { this.props.title }
            </Typography>
            <MediaQuery query={(theme) => theme.breakpoints.up('sm')}>
              {(theme) => theme ? <ProfileButton items={profileItems} /> : <></>}
            </MediaQuery>
          </Toolbar>
        </MaterialAppBar>
        <AppContext.Consumer>
          {({ userId, name, email, mobile, college }) => (
            <ProfileDialog userId={userId} name={name} email={email} mobile={mobile} college={college} opened={this.state.isProfileDialogOpen} onClose={() => this.closeProfileDialog()} />
          )}
        </AppContext.Consumer>
        <SignOutDialog />
      </>
    );
  }

  openSignOutDialog = () => {
    this.setState({ isSignOutDialogOpen: true });
  }

  closeSignOutDialog = () => {
    this.setState({ isSignOutDialogOpen: false });
  }

  openProfileDialog = () => {
    this.setState({ isProfileDialogOpen: true });
  }

  closeProfileDialog = () => {
    this.setState({ isProfileDialogOpen: false });
  }

  signOut = (destroySession: AppContextInterface['destroySession']) => {
    new Network(this.apiKey).doPost('/api/latest/session/logout');
    destroySession();
  }
}

interface ProfileButtonProps {
  items: typeof AppBar.items;
}

interface ProfileButtonState {
  profileMenuAnchor: HTMLElement|null;
}

class ProfileButton extends React.Component<ProfileButtonProps, ProfileButtonState> {

  constructor(props: ProfileButtonProps) {
    super(props);

    this.state = {
      profileMenuAnchor: null
    };
  }

  render() {
    const isOpen = Boolean(this.state.profileMenuAnchor);
    const buttonStyle = {
      color: 'black',
      textTransform: 'none',
      borderRadius: 28,
      paddingLeft: 2,
      paddingRight: 2,
    };

    return (
      <>
        <MaterialButton
          startIcon={<AccountCircleOutlined sx={{ color: 'black' }} />}
          variant="text"
          sx={buttonStyle}
          onClick={this.openProfileMenu}
        >
          <AppContext.Consumer>{({email}) => <span>{email}</span>}</AppContext.Consumer>
        </MaterialButton>
        <Menu 
          open={isOpen}
          anchorEl={this.state.profileMenuAnchor}
          onClose={this.closeProfileMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{ zIndex: 99999 }}
        >
          {Object.entries(this.props.items).map(([key, item]) => (
            <MenuItem key={key} onClick={() => { item.onClick(); this.closeProfileMenu(); }}>
              <span style={{ height: 24, marginRight: 12 }}>{item.icon}</span>{item.title}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  openProfileMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({ profileMenuAnchor: e.currentTarget });
  }

  closeProfileMenu = () => {
    this.setState({ profileMenuAnchor: null });
  }
}

interface ProfileDialogProps {
  /**
   * The username of the user
   */
  userId?: string;

  /**
   * The name of the user
   */
  name?: string;

  /**
   * The email of the user
   */
  email?: string;

  /**
   * The mobile of the user
   */
  mobile?: string;

  /**
   * The college of the user
   */
  college?: string;

  /**
   * `true` if the dialog is in it's opened state
   * @default false
   */
  opened?: boolean;

  /**
   * On close callback function
   */
  onClose: () => void;
}

class ProfileDialog extends React.Component<ProfileDialogProps, {}> {
  
  render() {
    const KeyValue = (props: { k: string, v?: any }) => (
      <Box sx={{ mb: 1, mr: 1 }}>
        <Typography variant="body1" color="primary.main" sx={{ wordBreak: 'break-word' }}>{props.k}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>{props.v}</Typography>
      </Box>
    );
    
    return(
      <Dialog onClose={this.props.onClose} open={this.props.opened  || false} maxWidth="xs" fullWidth>
        <DialogTitle onClose={this.props.onClose}>My Profile</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={6}>
              <KeyValue k="User ID" v={this.props.userId} />
            </Grid>
            <Grid item xs={6}>
              <KeyValue k="Name" v={this.props.name} />
            </Grid>
            <Grid item xs={6}>
              <KeyValue k="Email ID" v={this.props.email} />
            </Grid>
            <Grid item xs={6}>
              <KeyValue k="Mobile Number" v={this.props.mobile} />
            </Grid>
            <Grid item xs={6}>
              <KeyValue k="College Name" v={this.props.college} />
            </Grid>
          </Grid>
          <Link href="https://vitchennaievents.com/vibrance/login/?redirect=https://vitchennaievents.com/vibrance/profile" target="_blank">
            <Button variant="contained" sx={{ width: '100%', mt: 1 }}>Edit Profile</Button>
          </Link>
        </DialogContent>
      </Dialog>
    );
  }
}
