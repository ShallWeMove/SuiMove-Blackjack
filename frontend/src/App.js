import { Route, Routes, Outlet } from "react-router-dom";
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Game from './pages/Game';
import Landing from './pages/Landing';
import { ColorModeContext, useMode } from "./theme";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

export default function App() {
  const [theme, colorMode] = useMode();

  return (
    <ThemeProvider theme={theme} >
      <ColorModeContext.Provider value={colorMode}>
        <Box sx={{ flexGrow: 1 }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </Box>
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}