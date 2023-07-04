import AppBar from '@mui/material/AppBar';
import { useContext, useState } from 'react';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import WalletButton from './WalletButton';
import { WalletProvider } from '@suiet/wallet-kit';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext, tokens } from "../theme";

const Navbar = () => {

    const { toggleColorMode } = useContext(ColorModeContext);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const handleDarkModeToggle = () => {
        toggleColorMode();
    };

    return (
        <AppBar position="static"
            sx={{
                backgroundColor: colors.background[200],
                height: "7.36569rem",
                display: "flex",
                justifyContent: "center",
            }}>
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
                <Typography variant="h3" component="div" sx={{ flexGrow: 1, color: "#0054E7" }}>
                    Shall We Move
                </Typography>
                {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton color="inherit" onClick={handleDarkModeToggle}>
                        {theme.palette.mode === 'dark' ?
                            <Brightness7Icon sx={{ color: colors.background[100] }} />
                            :
                            <Brightness4Icon sx={{ color: colors.background[100] }} />
                        }
                    </IconButton>
                </Box> */}
                <WalletProvider>
                    <WalletButton />
                </WalletProvider>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;