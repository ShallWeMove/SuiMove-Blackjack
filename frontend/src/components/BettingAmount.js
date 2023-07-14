import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button } from "@mui/material";
// import { useWallet } from '@suiet/wallet-kit';
// import { JsonRpcProvider } from '@mysten/sui.js';

const BettingAmount = ({ setBettingAmount, error, handleStartButtonClick, bettingAmount }) => {

    // const wallet = useWallet();

    // const provider = new JsonRpcProvider();

    // console.log("Wallet address: ", wallet.account.address)
    // console.log('0x7bbc329dfd56ee727533887d82e414b5d61c6653a2684d32ff1739830521939f')

    // async function getAllCoins() {
    //     const allCoins = await provider.getAllCoins({
    //         owner: '0x7bbc329dfd56ee727533887d82e414b5d61c6653a2684d32ff1739830521939f',
    //         // owner: wallet.account.address,
    //     });

    //     console.log("allCoins: ", allCoins);
    // }

    // getAllCoins().catch(console.error);


    const handleChange = (e) => {
        setBettingAmount(e.target.value);
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
                onClick={handleStartButtonClick}
            >
                Game Start
            </Button>
        </Box>
    )
}

export default BettingAmount;