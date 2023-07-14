import React, { useState, useEffect } from 'react';
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import BlackJack from "../components/BlackJack.tsx";
import BettingAmount from "../components/BettingAmount";
import bg_landing from "../images/bg_landing.jpg";
import {fetchGameTableObject, fetchAllGameTables } from "../components/GetFunctions"
import { useWallet } from '@suiet/wallet-kit';
import GameTableList from '../components/GameTableList';

const Game = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [gameTableObjectId, setGameTableObjectId] = useState("");
    const [confirmed, setConfirmed] = useState(false);

    const [isPlaying, setIsPlaying] = useState(0);
    const [gameTableData, setGameTableData] = useState({});
    const [cardDeckData, setCardDeckData] = useState({});
    const [dealerHandData, setDealerHandData] = useState({});
    const [playerHandData, setPlayerHandData] = useState({});
    const [allGameTables, setAllGameTables] = useState([]);

    useEffect(() => {
        console.log("confirmed: ", confirmed);
        console.log("Gametable Object Id: ", gameTableObjectId);
    }, [confirmed, gameTableObjectId]);

    useEffect(() => {
        fetchAllGameTables(setAllGameTables);
    }, []);
    
    const handleGoToGameButtonClick = (id) => {
        getGameTableObjectData(id);
        // TODO: 
    }

    const resetGame = () => {
        setGameTableObjectId("");
        setConfirmed(false);
    }

    async function getGameTableObjectData(gametable_object_id) {
        fetchGameTableObject(
            gametable_object_id,
            setGameTableData, 
            setIsPlaying, 
            setCardDeckData, 
            setDealerHandData,
            setPlayerHandData,
            setConfirmed
            )
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
                        getGameTableObjectData={getGameTableObjectData}
                        gameTableObjectId={gameTableObjectId}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        />
                    </Box>
                    :
                    // <BettingAmount
                    //     setGameTableObjectId={setGameTableObjectId}
                    //     handleGoToGameButtonClick={handleGoToGameButtonClick}
                    //     gameTableObjectId={gameTableObjectId}
                    // />
                    <GameTableList
                        allGameTables={allGameTables}
                        gameTableObjectId={gameTableObjectId}
                        setGameTableObjectId={setGameTableObjectId}
                        handleGoToGameButtonClick={handleGoToGameButtonClick}                        
                    />
            }
        </Box>
    )
}

export default Game;

