import React, { useState, useEffect } from 'react';
import { CircularProgress, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { Box } from "@mui/material";
import BlackJack from "../components/BlackJack.tsx";
import BettingAmount from "../components/BettingAmount";
import bg_landing from "../images/bg_landing.jpg";
import { fetchGameTableObject, fetchAllGameTables } from "../components/GetFunctions"
import { useWallet } from '@suiet/wallet-kit';
import GameTableList from '../components/GameTableList';
import bgSound from '../images/bg_sound.mp3';
import buttonSound from "../images/button_sound.mp3";
import useSound from 'use-sound';

const Game = () => {
    const [playButtonSound] = useSound(buttonSound);
    const [playBgSound, { stop }] = useSound(bgSound, { volume: 1, loop: true });

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [gameTableObjectId, setGameTableObjectId] = useState("");
    const [gameTableConfirmed, setGameTableConfirmed] = useState(false);
    const [bettingAmount, setBettingAmount] = useState("10000");
    const [error, setError] = useState(false);
    const [bettingConfirmed, setBettingConfirmed] = useState(false);

    const [isPlaying, setIsPlaying] = useState(0);
    const [gameTableData, setGameTableData] = useState({});
    const [cardDeckData, setCardDeckData] = useState({});
    const [dealerHandData, setDealerHandData] = useState({});
    const [playerHandData, setPlayerHandData] = useState({});
    const [allGameTables, setAllGameTables] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("confirmed: ", gameTableConfirmed);
        console.log("Gametable Object Id: ", gameTableObjectId);
    }, [gameTableConfirmed, gameTableObjectId]);

    useEffect(() => {
        fetchAllGameTables(setAllGameTables);
    }, []);

    useEffect(() => {
        if (bettingAmount !== "") {
            setError(isNaN(bettingAmount) || bettingAmount % 1 !== 0 || bettingAmount <= 0);
        }
    }, [bettingAmount]);

    const handleStartButtonClick = () => {
        setBettingConfirmed(true);
    }

    const handleGoToGameButtonClick = (id) => {
        playBgSound();
        playButtonSound()
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
            setGameTableConfirmed,
            setLoading,
            setBettingAmount,
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
             {loading && (
                    <Box 
                    sx={{
                        position: 'fixed',
                        top: '60%',
                        left: '50%',
                        width: '100px',
                        height: '100px',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <CircularProgress color='secondary' />
                    </Box>
                )}
            {
                gameTableConfirmed ?
                    <Box>
                        {
                            bettingConfirmed || isPlaying >= 1 ?
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
                                    loading={loading}
                                    setLoading={setLoading}
                                />
                                :
                                <BettingAmount
                                    setBettingAmount={setBettingAmount}
                                    error={error}
                                    handleStartButtonClick={handleStartButtonClick}
                                    bettingAmount={bettingAmount}
                                />
                        }
                    </Box>
                    :
                    <GameTableList
                        allGameTables={allGameTables}
                        gameTableObjectId={gameTableObjectId}
                        setGameTableObjectId={setGameTableObjectId}
                        handleGoToGameButtonClick={handleGoToGameButtonClick}
                        setLoading={setLoading}
                    />
            }
        </Box>
    )
}

export default Game;

