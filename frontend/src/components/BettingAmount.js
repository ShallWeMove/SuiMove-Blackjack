import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button } from "@mui/material";

const BettingAmount = ({ setGameTableObjectId, error, handleGoToGameButtonClick, gameTableObjectId }) => {

    const handleChange = (e) => {
        setGameTableObjectId(e.target.value);
    }

    return (
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
                {/* Betting Amount */}
                GameTable Object ID
            </Typography>
            <TextField
                id="gametable-object-id"
                label="Please enter the gametable object id."
                value={gameTableObjectId}
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
                sx={{
                    width: "20.875rem",
                    height: "3.53119rem",
                    borderRadius: "30px"
                }}
                onClick={handleGoToGameButtonClick}
            >
                Go To Game
            </Button>
        </Box>
    )
}

export default BettingAmount;
