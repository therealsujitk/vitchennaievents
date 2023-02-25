import { createTheme } from '@mui/material';
import { deepOrange } from '@mui/material/colors';

const DarkTheme = createTheme({
  typography: {
    fontFamily: 'Rubik, sans-serif'
  },
  palette: {
    mode: 'dark',
    primary: deepOrange,
    background: {
      default: '#212121',
      paper: '#1a1a1a',
    }
  },
  shape: {
    borderRadius: 8,
  }
});

export { DarkTheme };
