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

    const [gameTableObjectId, setGameTableObjectId] = useState("");
    const [confirmed, setConfirmed] = useState(false);

    const [gameTableData, setGameTableData] = useState({});
    const [isPlaying, setIsPlaying] = useState(0);
    const [cardDeckData, setCardDeckData] = useState({});
    const [dealerHandData, setDealerHandData] = useState({});
    const [playerHandData, setPlayerHandData] = useState({});

    useEffect(() => {
        console.log("confirmed: ", confirmed);
        console.log("Gametable Object Id: ", gameTableObjectId);
    }, [confirmed, gameTableObjectId]);
    
    const handleGoToGameButtonClick = () => {
        
        getGameTableObject(gameTableObjectId);
        // TODO: 
    }

    const resetGame = () => {
        setGameTableObjectId("");
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

    async function getGameTableObject(gametable_object_id) {

        const response = await getObject(gametable_object_id)
        console.log("game table",response);

        try {
            setGameTableData(response.data.result.data.content.fields);
            const is_playing = response.data.result.data.content.fields.is_playing;
            setIsPlaying(is_playing);
            
            const READY=1;
            if (is_playing >= READY) {
                const card_deck_id = await response.data.result.data.content.fields.card_deck;
                const dealer_hand_id = await response.data.result.data.content.fields.dealer_hand;
                const player_hand_id = await response.data.result.data.content.fields.player_hand;
    
                // setCardDeckObjectId(card_deck);
                const card_deck_response = await getObject(card_deck_id);
                console.log("card deck", card_deck_response)
                setCardDeckData(card_deck_response.data.result.data.content.fields);
                const dealer_hand_response = await getObject(dealer_hand_id);
                console.log("dealer hand", dealer_hand_response)
                setDealerHandData(dealer_hand_response.data.result.data.content.fields);
                const player_hand_response = await getObject(player_hand_id);
                console.log("player hand", player_hand_response)
                setPlayerHandData(player_hand_response.data.result.data.content.fields);
            }
            setConfirmed(true);
        } catch(err) {
            console.log("error for getting game table information");
            setConfirmed(false);
        }
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
                        gameTableData={gameTableData}
                        cardDeckData={cardDeckData}
                        dealerHandData={dealerHandData}
                        playerHandData={playerHandData}
                        getGameTableObject={getGameTableObject}
                        gameTableObjectId={gameTableObjectId}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        getObject={getObject}
                        />
                    </Box>
                    :
                    <BettingAmount
                        setGameTableObjectId={setGameTableObjectId}
                        handleGoToGameButtonClick={handleGoToGameButtonClick}
                        gameTableObjectId={gameTableObjectId}
                    />
            }
        </Box>
    )
}

export default Game;

