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

    const [gameTableInfo, setGameTableInfo] = useState({});
    const [cardDeckInfo, setCardDeckInfo] = useState({});
    const [dealerHandInfo, setDealerHandInfo] = useState({});
    const [playerHandInfo, setPlayerHandInfo] = useState({});

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
        getGameTableObject(config.GAMETABLE_OBJECT_ID);
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
        // console.log(response);
        return response;
    }

    async function getGameTableObject(object_id) {
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
        console.log("game table",response);
        setGameTableInfo(response.data.result.data.content.fields);

        const card_deck_id = await response.data.result.data.content.fields.card_deck;
        const dealer_hand_id = await response.data.result.data.content.fields.dealer_hand;
        const player_hand_id = await response.data.result.data.content.fields.player_hand;

        // setCardDeckObjectId(card_deck);
        const card_deck_response = await getObject(card_deck_id);
        console.log("card deck", card_deck_response)
        setCardDeckInfo(card_deck_response.data.result.data.content.fields);
        const dealer_hand_response = await getObject(dealer_hand_id);
        console.log("dealer hand", dealer_hand_response)
        setDealerHandInfo(dealer_hand_response.data.result.data.content.fields);
        const player_hand_response = await getObject(player_hand_id);
        console.log("player hand", player_hand_response)
        setPlayerHandInfo(player_hand_response.data.result.data.content.fields);
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
                        <BlackJack 
                        resetGame={resetGame} 
                        gameTableInfo={gameTableInfo}
                        cardDeckInfo={cardDeckInfo}
                        dealerHandInfo={dealerHandInfo}
                        playerHandInfo={playerHandInfo}
                        />
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

