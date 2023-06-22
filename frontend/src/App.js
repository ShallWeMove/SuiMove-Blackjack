import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import WalletButton from './components/WalletButton';
import { WalletProvider } from '@suiet/wallet-kit';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';

export default function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "white" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              color: "#0054E7"
            }}
          >
            <DiamondOutlinedIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#0054E7" }}>
            Shall We Move
          </Typography>
          <WalletProvider>
            <WalletButton />
          </WalletProvider>
        </Toolbar>
      </AppBar>
      <h1>
        To Be Continued...
      </h1>
    </Box>
  );
}