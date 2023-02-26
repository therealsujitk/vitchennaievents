import { Event, Storefront } from "@mui/icons-material";
import { Divider } from "@mui/material";
import MaterialDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import React from "react";
import { Link } from "react-router-dom";
import { MediaQuery } from "../../components";
import AppBar from "../app-bar/app-bar";

interface DrawerProps {
  /**
   * If `true`, the drawer will be permanent
   */
  permanent?: boolean;

  /**
   * If `true`, the drawer will be open
   */
  open?: boolean;

  /**
   * onClose listener
   */
  onClose: () => void;
}

interface DrawerState {
  /**
   * The key of the selected item
   */
  selected: keyof typeof Drawer.items;
}

export default class Drawer extends React.Component<DrawerProps, DrawerState> {
  static items = {
    events: {
      title: "My Events",
      description: "Your registered events and tickets.",
      icon: <Event />
    },
    merchandise: {
      title: "My Merchandise",
      description: "Your purchased merchandise.",
      icon: <Storefront />,
    },
  };
  static width = 260;

  constructor(props : DrawerProps) {
    super(props);

    this.state = {
      selected: 'events'
    };

    this.handleClick.bind(this);
  }

  render() {
    return (
      <MaterialDrawer
        variant={this.props.permanent ? 'permanent' : 'temporary'}
        anchor="left"
        open={this.props.open}
        onClose={() => this.props.onClose()}
        sx={{
          "& .MuiPaper-root": {
            backgroundImage: "none",
            bgcolor: "background.default",
            width: Drawer.width,
          },
        }}
      >
        <Toolbar />
        <List>
          {Object.entries(Drawer.items).map(([key, item]) => (
            <Link key={key} to={`/${key}`} style={{color: 'inherit', textDecoration: 'none'}}>
              <ListItemButton selected={key === this.state.selected} onClick={() => this.handleClick(key)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </Link>
          ))}
          <MediaQuery query={(theme) => theme.breakpoints.up('sm')}>
            {(result) => !result ? (
              <>
                <Divider />
                {Object.entries(AppBar.items).map(([key, item]) => (
                  <ListItemButton selected={key === this.state.selected} onClick={() => item.onClick()}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                ))}
              </>
            ) : <></>}
          </MediaQuery>
        </List>
      </MaterialDrawer>
    );
  }

  handleClick(selected: string) {
    this.setState({selected: selected as keyof typeof Drawer.items});
    this.props.onClose();
  }
}
