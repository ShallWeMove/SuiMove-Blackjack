import React from 'react'
import { useTheme } from "@mui/material";
import { ColorModeContext, tokens } from "../theme";
import { Typography } from "@mui/material";

const Landing = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <div>
            <Typography sx={{
                color: colors.greenAccent[400]
            }}>
                This is Landing
            </Typography>
        </div>
    )
}

export default Landing