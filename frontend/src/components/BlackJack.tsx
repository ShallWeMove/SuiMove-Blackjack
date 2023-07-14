import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Input, Typography } from '@mui/material';
import BackgroundImage from "../images/background.jpg";
import config from "../config.json";
import { useWallet } from '@suiet/wallet-kit';
import {TransactionBlock } from '@mysten/sui.js';
import GameTableInfo from './GameTableInfo';
import { SuiSignAndExecuteTransactionBlockInput } from "@mysten/wallet-standard"
import CardDeck from './CardDeck';
import DealerCardsBox from './DealerCardsBox';
import PlayerCardsBox from './PlayerCardsBox';
import SideBar from './SideBar';
import useSound from 'use-sound';


type Card = {
    id: string,
    card_number: number,
    sequence_number: number,
    is_open: boolean,
};

// Create a WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

// const BlackJack: React.FC = () => {
const BlackJack = ({
    gameTableData, 
    cardDeckData, 
    dealerHandData, 
    playerHandData, 
    getGameTableObjectData, 
    gameTableObjectId, 
    isPlaying,
    bettingAmount,
    setLoading,
}) => {
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    const [playerTotal, setPlayerTotal] = useState(0);
    const [dealerTotal, setDealerTotal] = useState(0);

    const wallet = useWallet();

    const [playButtonSound] = useSound('/button_sound.mp3');

    useEffect(() => {
        if (wallet.status === 'connected') {
            console.log('blackjack wallet status: ', wallet.status)
            console.log('blackjack wallect balance: ', wallet.address)
        } else {
            console.log('blackjack wallet status', wallet.status)
        }
        console.log("betting amount : ", bettingAmount)

    }, [wallet.connected])

    // Handle incoming WebSocket messages
    useEffect(() => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.flag) {
                case 'start game done':
                    getGameTableObjectData(gameTableObjectId);
                    console.log("game start done!!!!!");
                    break;
                case 'get card done':
                    getGameTableObjectData(gameTableObjectId);
                    console.log("get card done!!!!!");
                    break;

                case 'stop game done':
                    // handle Stop done
                    getGameTableObjectData(gameTableObjectId);
                    console.log("game stop done!!!!!");
                    break;

                default:
                    break;
            }
        };
    }, []);

    useEffect(() => {
        let total = 0;
        if (isPlaying >= 1) {
            for(let i = 0; i < playerHandData.cards.length; i++) {
                const num = parseInt(playerHandData.cards[i].card_number) % 13;
                if(num < 10000) total += config.REAL_NUMS[num];
            }
            setPlayerTotal(total);
    
            total = 0;
            for(let i = 0; i < dealerHandData.cards.length; i++) {
                const num = parseInt(dealerHandData.cards[i].card_number) % 13;
                if(num < 10000) total += config.REAL_NUMS[num];
            }
            setDealerTotal(total);
        }
        
    }, [playerHandData, dealerHandData, isPlaying]);

    // now this function works!
    const gameReady = async() => {
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(parseInt(bettingAmount))]);
        tx.setGasBudget(30000000);
        const package_id = config.PACKAGE_OBJECT_ID;
        const module = "blackjack"
        const function_name = "ready_game"
        tx.moveCall({
            target: `${package_id}::${module}::${function_name}`,
            arguments: [tx.object(config.GAME_INFO_OBJECT_ID), tx.object(gameTableObjectId) , coin],
        });

        const stx: Omit<SuiSignAndExecuteTransactionBlockInput,'sui:testnet'> = {
            transactionBlock: tx,
            account: wallet.account!,
            chain: 'sui:testnet'
        }

        try {
            console.log(await wallet.signAndExecuteTransactionBlock(stx))
        } catch (err) {
            console.log(err)
        }
    }

    // --------------------------------------------------------------------
    // Socket send flag
    const handleGameReady = async () => {
        if (isPlaying < 1) {
            playButtonSound();

            setLoading(true);
            await gameReady();
            await getGameTableObjectData(gameTableObjectId);
            console.log('game ready done!!!!!')
        }
    }

    const handleGameStart = () => {
        playButtonSound();

        setLoading(true);
        socket.send(JSON.stringify({ 
            flag: 'Start Game', 
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address,
            bettingAmount: bettingAmount
        }));
    }

    const handleHit = async () => {
        playButtonSound();

        setLoading(true);
        socket.send(JSON.stringify({ 
            flag: 'Go Card',
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address 
    }));
    }

    const handleStand = () => {
        setLoading(true);

        playButtonSound();
        socket.send(JSON.stringify({ 
            flag: 'Stop Game',
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address 
        }));
    }

    const handleEndGame = () => {
        setLoading(true);

        setLoading(false);
    }

    // --------------------------------------------------------------------
    console.log("Player Hands: ", playerHandData)

    return (
        <Box
            sx={{
                backgroundImage: `url(${BackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                width: '100vw',
                paddingTop: '14vh',
                paddingX: '50px',
            }}
        >
            <h2>Blackjack Game Table : {gameTableObjectId}</h2>
            <h2>Player : {playerHandData.account}</h2>
            <h2>Game Status : {isPlaying == 0 ? "Not Ready" : isPlaying == 1? "Ready" : "Playing"}</h2>
            <h3>Bet Amount : {bettingAmount/1000000000} SUI</h3>

            <Box sx={{
                marginBottom: "20px",
            }}>
                    <Box
                    sx={{
                        border: "1px solid white",
                        display: "inline-block",
                        paddingX: "10px",
                        borderRadius: "20px",
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <h3>Dealer's cards:</h3>
                            <ul style={{
                                display: 'flex',
                            }}>
                                {isPlaying == 2 &&
                                dealerHandData.cards.map((card, i)=> {
                                    if(card.card_number < 10000) {
                                        return <Typography key={i} sx={{marginRight: "10px"}}>{config.CARD_NUMS[card.card_number % 13]}</Typography>     
                                    }   else {
                                        return (<Typography key={i} sx={{marginRight: "10px"}} >hidden</Typography>)
                                    }        
                                })}
                            </ul>
                        </Box>
                    
                        <h3>Total: {dealerTotal}</h3>
                    </Box>
            </Box>

            <Box>
                <Box 
                sx={{
                    border: "1px solid white",
                    display: "inline-block",
                    paddingX: "10px",
                    borderRadius: "20px",
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <h3>Player's cards:</h3>
                        <ul style={{
                            display: 'flex',
                        }}>
                            {isPlaying == 2 && 
                            playerHandData.cards.map((card, i) => {
                                if(card.card_number < 10000) {
                                    return <Typography key={i} sx={{marginRight: "10px"}}>{config.CARD_NUMS[card.card_number % 13]}</Typography>     
                                }   else {
                                    return <Typography key={i} sx={{marginRight: "10px"}}>hidden</Typography>
                                }
                            })}
                        </ul>
                    </Box>

                    <h3>Total: {playerTotal}</h3>
                </Box>
            </Box>


            {/* Card Deck : handleHit 빼는 것 어떻습니까? by TW*/}
            {isPlaying >= 1 
            ? <CardDeck cardDeckData={cardDeckData} handleHit={handleHit} /> : <Box/>}

            {/* Dealer Cards Box */}
            {isPlaying == 2 
            ?  <DealerCardsBox dealerHandData={dealerHandData}/> : <Box/> }

            {/* Player Cards Box */}
            {isPlaying == 2 
            ?  <PlayerCardsBox playerHandData={playerHandData}/> : <Box/> }
            {<SideBar/>}

            <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '60vw',
                position: 'fixed',
                bottom: '50px',
                left: '20vw',
            }}>
                {isPlaying < 1 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }} onClick={handleGameReady}>Game Ready</Button> : <Box/>}
                {isPlaying < 2 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleGameStart}>Game Start</Button> : <Box/>}
                
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleHit}>Hit</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleStand}>Stand</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleEndGame}>End Game</Button>
            </Box>
        </Box>
    );
}

export default BlackJack;
