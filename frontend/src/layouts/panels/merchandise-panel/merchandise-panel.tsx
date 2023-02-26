import { Box, Card, CardContent, CardMedia, CircularProgress, Grid, Typography } from "@mui/material";
import Cookies from 'js-cookie';
import React from "react";
import { EmptyState } from '../../../components';
import { AppContext, AppContextInterface } from '../../../contexts/app';
import Network from '../../../utils/network';
import Drawer from "../../drawer/drawer";
import PanelHeader from "../../panel-header/panel-header";

interface MerchandisePanelState {
  /**
   * The list of Merchandise
   */
  merchandise: Merchandise[];

  /**
   * If `true`, the panel is in a loading state
   * @default true
   */
  isLoading: boolean;
}

interface Merchandise {
  name: string;
  image: string;
  size: string;
  quantity: number;
  status: string;
}

export default class MerchandisePanel extends React.Component<{}, MerchandisePanelState> {
  username: string;
  password: string;

  onError?: AppContextInterface['displayError'];

  constructor(props : {}) {
    super(props);

    this.state = {
      merchandise: [],
      isLoading: true
    };

    this.username = Cookies.get('username')!;
    this.password = Cookies.get('password')!;
  }

  componentDidMount() {
    this.getMerchandise(this.onError!);
  }

  render() {
    const panelInfo = Drawer.items['merchandise'];

    const KeyValue = (props: { k: string, v?: any }) => (
      <Box sx={{ mt: 1, mr: 1 }}>
        <Typography variant="body1" color="primary.main" sx={{ wordBreak: 'break-word' }}>{props.k}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>{props.v}</Typography>
      </Box>
    );

    const MerchandiseCard = (props: Merchandise) => (
      <Card sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <CardMedia component="img" image={props.image} sx={{
          width: '40%'
        }} />
        <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5">{props.name}</Typography>
          <Grid container>
            <Grid item xs={6}>
              <KeyValue k="Size" v={props.size} />
            </Grid>
            <Grid item xs={6}>
              <KeyValue k="Quantity" v={props.quantity} />
            </Grid>
            <Grid item xs={6}>
              <KeyValue k="Status" v={props.status} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );

    return (
      <Box>
        <AppContext.Consumer>
          {({displayError}) => {this.onError = displayError; return <></>;}}
        </AppContext.Consumer>
        <PanelHeader title={panelInfo.title} icon={panelInfo.icon} description={panelInfo.description} />
        <Box sx={{ pl: 2, pt: 2, overflowAnchor: 'none' }}>
          {this.state.isLoading || this.state.merchandise.length != 0
            ? (
              <Grid container spacing={2} sx={{ pr: 2, pb: 2 }}>
                {
                  this.state.merchandise.map((e, i) => (
                    <Grid item key={i} xs={12} sm={12} md={6} lg={6} xl={3}>
                      <MerchandiseCard {...e} />
                    </Grid>
                  ))
                }
              </Grid>
            )
            : (<EmptyState>No merchandise purchased.</EmptyState>)
          }
          <Box textAlign="center">
            <CircularProgress sx={{ mt: 5, mb: 5, visibility: this.state.isLoading ? 'visible' : 'hidden' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  getMerchandise = async (onError: AppContextInterface['displayError']) => {
    try {
      const credentials = {
        'x-username': this.username,
        'x-password': this.password,
      };

      const response = await new Network().doPost("/profile/api/latest/user/merchandise", { headers: credentials, body: {} });
      const merchandise: Merchandise[] = [];

      for (var i = 0; i < response.merchandise.length; ++i) {
        const merch: Merchandise = {
          name: response.merchandise[i].name,
          image: response.merchandise[i].image,
          size: response.merchandise[i].size,
          quantity: response.merchandise[i].quantity,
          status: response.merchandise[i].status,
        };

        merchandise.push(merch);
      }

      this.setState({ 
        merchandise: merchandise,
        isLoading: false
      });
    } catch (err: any) {
      onError(err, { name: 'Retry', onClick: () => this.getMerchandise(onError) });
    }
  }
}
