import React, { useState, useEffect } from 'react';
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import BlackJack from "../components/BlackJack.tsx";
import BettingAmount from "../components/BettingAmount";
import bg_landing from "../images/bg_landing.jpg";
import { fetchGameTableObject, fetchAllGameTables } from "../components/GetFunctions"
import { useWallet } from '@suiet/wallet-kit';
import GameTableList from '../components/GameTableList';

const Game = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [gameTableObjectId, setGameTableObjectId] = useState("");
    const [gameTableConfirmed, setGameTableConfirmed] = useState(false);
    const [bettingAmount, setBettingAmount] = useState("");
    const [error, setError] = useState(false);
    const [bettingConfirmed, setBettingConfirmed] = useState(false);
    const [balance, setBalance] = useState(0);

    const [isPlaying, setIsPlaying] = useState(0);
    const [gameTableData, setGameTableData] = useState({});
    const [cardDeckData, setCardDeckData] = useState({});
    const [dealerHandData, setDealerHandData] = useState({});
    const [playerHandData, setPlayerHandData] = useState({});
    const [allGameTables, setAllGameTables] = useState([]);

    useEffect(() => {
        console.log("confirmed: ", gameTableConfirmed);
        console.log("Gametable Object Id: ", gameTableObjectId);
    }, [gameTableConfirmed, gameTableObjectId]);

    useEffect(() => {
        fetchAllGameTables(setAllGameTables);
    }, []);

    useEffect(() => {
        if (bettingAmount !== "") {
            if (isNaN(bettingAmount) || bettingAmount <= 0) {
                setError("Please input a valid number");
            } else if (bettingAmount > balance / 1000000000) {
                setError("Insufficient wallet balance");
            } else {
                setError(false);
            }
        }
    }, [bettingAmount, balance]);

    const handleStartButtonClick = () => {
        setBettingConfirmed(true);
    }

    const handleGoToGameButtonClick = (id) => {
        getGameTableObjectData(id);
        // TODO: 
    }

    const resetGame = () => {
        setGameTableObjectId("");
        setGameTableConfirmed(false);
    }

    async function getGameTableObjectData(gametable_object_id) {
        fetchGameTableObject(
            gametable_object_id,
            setGameTableData,
            setIsPlaying,
            setCardDeckData,
            setDealerHandData,
            setPlayerHandData,
            setGameTableConfirmed
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
                gameTableConfirmed ?
                    <Box>
                        {
                            bettingConfirmed ?
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
                                :
                                <BettingAmount
                                    setBettingAmount={setBettingAmount}
                                    error={error}
                                    handleStartButtonClick={handleStartButtonClick}
                                    bettingAmount={bettingAmount}
                                    balance={balance}
                                    setBalance={setBalance}
                                />
                        }
                    </Box>
                    :
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