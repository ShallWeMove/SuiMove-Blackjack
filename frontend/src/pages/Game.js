import React, { useState, useEffect } from 'react';
import { Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import BlackJack from "../components/BlackJack.tsx";
import BettingAmount from "../components/BettingAmount";
import bg_landing from "../images/bg_landing.jpg";
import axios from 'axios';
import config from "../config.json";

const Game = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [bettingAmount, setBettingAmount] = useState("");
    const [error, setError] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const [playerObjects, setPlayerObjects] = useState([]);
    const [cardDeckObjectId, setCardDeckObjectId] = useState("");

    // const tx = new TransactionBlock();
    // tx.setGasBudget(parseInt(process.env.GAS_BUDGET!));
    // tx.moveCall({
    //     target: target,
    //     arguments: argument,
    // });

    

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
        getObject(config.GAMETABLE_OBJECT_ID);
        // TODO: 
    }

    const resetGame = () => {
        setBettingAmount("");
        setConfirmed(false);
    }



    async function getObject(object_id) {
        const response = await axios.post(config.TESTNET_ENDPOINT, {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sui_getObject",
            "params": [
                object_id,
                {
                    "showType": true,
                    "showOwner": true,
                    "showPreviousTransaction": false,
                    "showDisplay": false,
                    "showContent": true,
                    "showBcs": false,
                    "showStorageRebate": false
                },
            ]
        });
        console.log(response);
        const card_deck = response.data.result.data.content.fields.card_deck;
        const dealer_hand = response.data.result.data.content.fields.dealer_hand;
        const player_hand = response.data.result.data.content.fields.player_hand;

        // const objects = response.data.result.data.map(e => {
        //     const obj = {id: e.data.content.fields.id.id, card_deck_id: e.data.content.fields.card_deck};
        //     return obj;
        // });

        // console.log(objects);
        
        setCardDeckObjectId(card_deck);
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

