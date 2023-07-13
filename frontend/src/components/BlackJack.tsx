import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Typography } from '@mui/material';
import BackgroundImage from "../images/background.jpg";
import config from "../config.json";
import { useWallet } from '@suiet/wallet-kit';
import {TransactionBlock } from '@mysten/sui.js';
import GameTableInfo from './GameTableInfo';
import { SuiSignAndExecuteTransactionBlockInput } from "@mysten/wallet-standard"
import CardDeck from './CardDeck';
import DealerCardsBox from './DealerCardsBox';
import PlayerCardsBox from './PlayerCardsBox';

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
}) => {
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    const wallet = useWallet();

    useEffect(() => {
        if (wallet.status === 'connected') {
            console.log('blackjack wallet status: ', wallet.status)
            console.log('blackjack wallect balance: ', wallet.address)
        } else {
            console.log('blackjack wallet status', wallet.status)
        }
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

    // now this function works!
    const gameReady = async() => {
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(10000)]);
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

        console.log(await wallet.signAndExecuteTransactionBlock(stx))
    }

    const handleGameReady = async () => {
        await gameReady();
        await getGameTableObjectData(gameTableObjectId);
        console.log('game ready done!!!!!')
    }

    const handleGameStart = () => {
        socket.send(JSON.stringify({ 
            flag: 'Start Game', 
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address 
        }));
    }

    const handleHit = async () => {
        socket.send(JSON.stringify({ 
            flag: 'Go Card',
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address 
    }));
    }

    const handleStand = () => {
        socket.send(JSON.stringify({ 
            flag: 'Stop Game',
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address 
        }));
    }

    console.log("Player Hands: ", playerHandData.cards)

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
            <h2>Playing : {isPlaying == 0 ? "Not Ready" : isPlaying == 1? "Ready" : "Playing"}</h2>

            {isPlaying>0 ? 
            <GameTableInfo
                gameTableData={gameTableData}
                cardDeckData={cardDeckData}
                dealerHandData={dealerHandData}
                playerHandData={playerHandData}
            /> 
            : <Typography>Not Ready</Typography>}
            

            {/* 디버깅용 */}
            <h3>Player's cards:</h3>
            <ul>
                {isPlaying == 2 ? 
                playerHandData.cards.map((card, i)=>(<Typography key={i}>{card}</Typography>)) : <Box/>}
            </ul>
            <h3>Dealer's cards:</h3>
            <ul>
                {isPlaying == 2 ? 
                dealerHandData.cards.map((card, i)=>(<Typography key={i}>{card}</Typography>)) : <Box/>}
            </ul>


            {/* Card Deck */}
            {isPlaying >= 1 
            ? <CardDeck cardDeckData={cardDeckData}/> : <Box/>}

            {/* Dealer Cards Box */}
            {isPlaying == 2 
            ?  <DealerCardsBox dealerHandData={dealerHandData}/> : <Box/> }

            {/* Player Cards Box */}
            {isPlaying == 2 
            ?  <PlayerCardsBox playerHandData={playerHandData}/> : <Box/> }

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
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }} onClick={handleGameReady}>Game Ready</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleGameStart}>Game Start</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleHit}>Hit</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleStand}>Stand</Button>
            </Box>
        </Box>
    );
}

export default BlackJack;
