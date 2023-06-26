import React, { useState, useEffect } from 'react';
import { useTheme, styled, alpha } from "@mui/material";
import { ColorModeContext, tokens } from "../theme";
import { Typography, Box, TextField, Button } from "@mui/material";

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

    const handleChange = (e) => {
        setBettingAmount(e.target.value);
    }

    const handleOnButtonClick = (e) => {
        setConfirmed(true)
        console.log(confirmed)
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                justifyContent: "space-around",
                height: "80vh",
            }}
        >
            {
                confirmed ?
                    <div>
                        blackjack
                    </div>
                    :
                    <Box sx={{
                        width: "23.8125rem",
                        height: "19rem",
                        boxShadow: 6,
                        bgcolor: "#FFF",
                        borderRadius: "30px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Typography variant="h1" sx={{
                            color: "#5D5A88",
                            fontWeight: "bold"
                        }}>
                            Betting Amount
                        </Typography>
                        <TextField
                            id="betting-amount"
                            label="Please enter the betting amount."
                            error={error}
                            helperText={error ? "Please input a valid number" : ""}
                            value={bettingAmount}
                            onChange={handleChange}
                            InputProps={{
                                sx: {
                                    backgroundColor: "#E5E5E5",
                                    color: "#121827",
                                    '&::placeholder': {
                                        color: "#121827",
                                    },
                                    borderRadius: "30px"
                                },
                            }}
                            InputLabelProps={{
                                sx: {
                                    color: '#ADABC3'
                                },
                            }}
                            sx={{
                                width: "20.875rem",
                                height: "2.53119rem",
                                marginBottom: 4,
                                marginTop: 6,
                                borderRadius: '30px',
                            }}
                        />
                        <Button
                            variant="contained"
                            disabled={error || bettingAmount === ""}
                            sx={{
                                width: "20.875rem",
                                height: "3.53119rem",
                                borderRadius: "30px"
                            }}
                            onClick={handleOnButtonClick}
                        >
                            Game Start
                        </Button>
                    </Box>
            }

        </Box >
    )
}

export default Game
