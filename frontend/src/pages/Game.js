import React from 'react'
import { useTheme } from "@mui/material";
import { ColorModeContext, tokens } from "../theme";
import { Typography } from "@mui/material";

const Game = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <Typography sx={{
            color: colors.primary[400]
        }}>
            This is Game
        </Typography>
    )
}

export default Game