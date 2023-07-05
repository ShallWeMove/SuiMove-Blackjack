import React, { useState, useEffect } from 'react';
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import BlackJack from "../components/BlackJack.tsx";
import BettingAmount from "../components/BettingAmount";
import bg_landing from "../images/bg_landing.png";

const Game = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [bettingAmount, setBettingAmount] = useState("");
    const [error, setError] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (bettingAmount !== "") {
            setError(isNaN(bettingAmount) || bettingAmount % 1 !== 0 || bettingAmount <= 0);
        }
    }, [bettingAmount]);

    useEffect(() => {
        console.log("confirmed: ", confirmed);
        console.log("error: ", error);
        console.log("betting amount: ", bettingAmount);
    }, [confirmed, error, bettingAmount]);

    const handleStartButtonClick = () => {
        setConfirmed(true);
    }

    const resetGame = () => {
        setBettingAmount("");
        setConfirmed(false);
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                justifyContent: "space-around",
                height: "100vh",
                backgroundImage: `url(${bg_landing})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {
                confirmed ?
                    <Box>
                        <BlackJack resetGame={resetGame} />
                    </Box>
                    :
                    <BettingAmount
                        setBettingAmount={setBettingAmount}
                        error={error}
                        handleStartButtonClick={handleStartButtonClick}
                        bettingAmount={bettingAmount}
                    />
            }
        </Box>
    )
}

export default Game;

