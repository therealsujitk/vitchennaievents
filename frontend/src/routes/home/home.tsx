import { Box, CssBaseline, Toolbar } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MediaQuery } from "../../components";
import { AppBar, Drawer } from "../../layouts";
import { EventsPanel, MerchandisePanel } from "../../layouts/panels";

interface HomeState {
  /**
   * If `true`, the drawer is opened
   */
  isDrawerOpen: boolean;
}

export default class Home extends React.Component<{}, HomeState> {

  constructor(props : {}) {
    super(props);

    this.state = {
      isDrawerOpen: false,
    };
  }

  render() {
    return (
      <MediaQuery query={(theme) => theme.breakpoints.up('md')}>
        {result => <Box>
          <CssBaseline />
          <AppBar showMenuIcon={!result} onMenuClick={() => this.toggleDrawer()} />
          <Box component="nav">
            <Drawer permanent={result} open={this.state.isDrawerOpen} onClose={() => this.toggleDrawer(false)} />
          </Box>
          <Box component="main" sx={{ ml: `${result ? Drawer.width : 0}px`}}>
            <Toolbar />
            <Routes>
              <Route path="/events" element={<EventsPanel />}></Route>
              <Route path="/merchandise" element={<MerchandisePanel />}></Route>
              <Route path="/" element={<Navigate to="/events" />} />
            </Routes>
          </Box>
        </Box>}
      </MediaQuery>
    );
  }

  toggleDrawer(isOpen? : boolean) {
    this.setState({isDrawerOpen: isOpen || !this.state.isDrawerOpen});
  }
}
