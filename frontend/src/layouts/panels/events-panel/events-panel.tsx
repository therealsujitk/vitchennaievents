import { Box, Button as MaterialButton, Card, CardActions, CardContent, CircularProgress, DialogContent, Grid, Link, Typography } from "@mui/material";
import Cookies from 'js-cookie';
import React from "react";
import { Button, Dialog, DialogTitle, EmptyState } from '../../../components';
import { AppContext, AppContextInterface } from '../../../contexts/app';
import Network from '../../../utils/network';
import Drawer from "../../drawer/drawer";
import PanelHeader from "../../panel-header/panel-header";
import QRCode from 'qrcode';
import logo from '../../../assets/images/logo.png';

interface EventsPanelState {
  /**
   * The list of events
   */
  events: Event[];

  /**
   * The current event details for the dialog
   */
  currentEvent?: Event;

  /**
   * If `true`, the panel is in a loading state
   * @default true
   */
  isLoading: boolean;
}

interface Event {
  orderId: number;
  title: string;
  location: string;
  date: string;
  time: string;
  isPaid: boolean;
}

export default class EventsPanel extends React.Component<{}, EventsPanelState> {
  username: string;
  password: string;

  onError?: AppContextInterface['displayError'];

  constructor(props : {}) {
    super(props);

    this.state = {
      events: [],
      currentEvent: undefined,
      isLoading: true
    };

    this.username = Cookies.get('username')!;
    this.password = Cookies.get('password')!;

    this.toggleDialog.bind(this);
  }

  componentDidMount() {
    this.getEvents(this.onError!);
  }

  render() {
    const panelInfo = Drawer.items['events'];

    const EventCard = (props: Event) => (
      <Card sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h5">{props.title}</Typography>
          <Typography variant="body1" color="grey">#{props.orderId}</Typography>
        </CardContent>
        <CardActions sx={{ alignItems: 'end', m: 1 }}>
          <MaterialButton sx={{ whiteSpace: 'nowrap' }} onClick={() => this.toggleDialog(props)}>View Ticket</MaterialButton>
        </CardActions>
      </Card>
    );

    return (
      <Box>
        <AppContext.Consumer>
          {({displayError}) => {this.onError = displayError; return <></>;}}
        </AppContext.Consumer>
        <PanelHeader title={panelInfo.title} icon={panelInfo.icon} description={panelInfo.description} />
        <Box sx={{ pl: 2, pt: 2, overflowAnchor: 'none' }}>
          {this.state.isLoading || this.state.events.length != 0
            ? (
              <Grid container spacing={2} sx={{ pr: 2, pb: 2 }}>
                {
                  this.state.events.map(e => (
                    <Grid item key={e.orderId} xs={12} sm={12} md={6} lg={6} xl={3}>
                      <EventCard {...e} />
                    </Grid>
                  ))
                }
              </Grid>
            )
            : (<EmptyState>No registered events.</EmptyState>)
          }
          <Box textAlign="center">
            <CircularProgress sx={{ mt: 5, mb: 5, visibility: this.state.isLoading ? 'visible' : 'hidden' }} />
          </Box>
        </Box>
        <EventDialog
          event={this.state.currentEvent}
          opened={this.state.currentEvent !== undefined}
          onClose={() => this.toggleDialog(undefined)} />
      </Box>
    );
  }

  toggleDialog = (event?: Event) => {
    this.setState({currentEvent: event});
  }

  getEvents = async (onError: AppContextInterface['displayError']) => {
    try {
      const credentials = {
        'x-username': this.username,
        'x-password': this.password,
      };

      const response = await new Network().doPost("/api/latest/user/events", { headers: credentials, body: {} });
      const events: Event[] = [];

      for (var i = 0; i < response.events.length; ++i) {
        const event: Event = {
          orderId: response.events[i].order_id,
          title: response.events[i].title,
          location: response.events[i].location,
          date: response.events[i].date,
          time: response.events[i].time,
          isPaid: response.events[i].is_paid,
        };

        events.push(event);
      }

      this.setState({ 
        events: events,
        isLoading: false
      });
    } catch (err: any) {
      onError(err, { name: 'Retry', onClick: () => this.getEvents(onError) });
    }
  }
}

interface EventDialogProps {
  /**
   * The event being edited or deleted
   * @default undefined
   */
  event?: Event;

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

interface EventDialogState {
  /**
   * The data url string for the generate QR code
   */
  qrDataUrl: string|null;
}

class EventDialog extends React.Component<EventDialogProps, EventDialogState> {
  qrGenerated: boolean;
  event?: Event;

  constructor(props: EventDialogProps) {
    super(props);
    
    this.state = {
      qrDataUrl: null
    };

    this.qrGenerated = false;
  }

  componentDidUpdate() {
    if (!this.props.event) {
      this.qrGenerated = false;
    } else if (!this.qrGenerated) {
      this.qrGenerated = true;
      this.event = this.props.event;

      QRCode.toDataURL(this.props.event.orderId.toString(), {
        errorCorrectionLevel: 'M',
        version: 2,
        width: 500,
        margin: 1.5,
      }, (err, url) => this.setState({ qrDataUrl: url }));
    }
  }
  
  render() {
    const KeyValue = (props: { k: string, v?: any }) => (
      <Box sx={{ mt: 1, mr: 1 }}>
        <Typography variant="body1" color="primary.main" sx={{ wordBreak: 'break-word' }}>{props.k}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>{props.v}</Typography>
      </Box>
    );

    return(
      <Dialog onClose={this.props.onClose} open={this.props.opened || false}>
        <DialogTitle onClose={this.props.onClose}>Event Ticket</DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <div style={{ position: 'relative', width: '200px', margin: 'auto' }}>
                <img src={this.state.qrDataUrl ?? undefined} style={{ width: '100%', borderRadius: '15px' }} />
                <img src={logo} style={{ position: 'absolute', width: '25%', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', border: '4px solid #FFFFFF', borderRadius: '1000px' }} />
              </div>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={12} sx={{ height: '1px', overflow: 'hidden', margin: '1rem 0' }}>
                <hr style={{ border: 'none', borderBottom: '1px dashed', margin: '0', borderWidth: '5px' }} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{this.event?.title}</Typography>
              </Grid>
              <Grid item xs={6}>
                <KeyValue k="Order ID" v={this.event?.orderId} />
              </Grid>
              <Grid item xs={6}>
                <KeyValue k="Location" v={this.event?.location} />
              </Grid>
              <Grid item xs={6}>
                <KeyValue k="Date" v={this.event?.date} />
              </Grid>
              <Grid item xs={6}>
                <KeyValue k="Time" v={this.event?.time} />
              </Grid>
              <Grid item xs={6}>
                <KeyValue k="Payment Status" v={this.event?.isPaid ? 'Paid': 'Unpaid'} />
              </Grid>
            </Grid>
          </Grid>
          {!this.event?.isPaid && <Link href="https://vitchennaievents.com/vibrance/login/?redirect=https://vitchennaievents.com/vibrance/profile" target="_blank">
            <Button variant="contained" sx={{ width: '100%', mt: 1 }}>Pay Now</Button>
          </Link>}
        </DialogContent>
      </Dialog>
    );
  }
}
