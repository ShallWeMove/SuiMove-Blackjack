import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
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

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]; // values for 2-10, J, Q, K

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


    
    
    // async function setCards(cardsData, setCardsFunction) {
    //     let cardList : Card[];
    //     cardsData.cards.map(async (card_id) => {
    //         const response = await getObject(card_id);
    //         let card : Card = {
    //             id : card_id,
    //             card_number: response.data.result.data.content.fields.card_number,
    //             sequence_number: response.data.result.data.content.fields.sequence_number,
    //             is_open: response.data.result.data.content.fields.is_open,
    //         }

    //     });

    //     setCardsFunction(cardList);
    // }
    

    // Handle incoming WebSocket messages
    useEffect(() => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.flag) {
                case 'start game done':
                    console.log("game start done!!!!!");
                    break;
                case 'ready game done':
                    console.log("game ready done!!!!!");
                    break;
                case 'get card done':
                    console.log("get card done!!!!!");
                    break;

                case 'Stop done':
                    // handle Stop done
                    break;

                default:
                    break;
            }
        };

        // Send game start message on component mount
        // socket.send(JSON.stringify({ flag: 'game ready' }));
        // console.log("USE EFFECT of BlackJack!!")
    }, []);


    const wallet = useWallet();

    // 작동 안 함...ㅜ
    const gameReady = async() => {
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(10000)]);
        // tx.pure(wallet.address)
        tx.moveCall({
            target: '0x4b3bfa005ed21de65788549977512c2e4761bdd7640e9ed5ff240b8b1fd9f2ea::blackjack::ready_game',
            arguments: [tx.object(config.GAME_INFO_OBJECT_ID), tx.object(gameTableObjectId) , coin],
        });

        const stx: Omit<SuiSignAndExecuteTransactionBlockInput,'sui:testnet'> = {
            transactionBlock: tx,
            account: wallet.account!,
            chain: 'sui:testnet'
        }

        console.log(await wallet.signAndExecuteTransactionBlock(stx))
    }

    const handleGameReady = () => {
        // socket.send(JSON.stringify({ flag: 'game ready' }));
        gameReady();
        console.log('here is handleGameReady')
        getGameTableObjectData(gameTableObjectId);
    }

    const handleGameStart = () => {
        socket.send(JSON.stringify({ flag: 'game start' }));
        getGameTableObjectData(gameTableObjectId);
    }

    const handleHit = async () => {
        socket.send(JSON.stringify({ flag: 'Go' }));
        getGameTableObjectData(gameTableObjectId);
    }

    const handleStand = () => {
        socket.send(JSON.stringify({ flag: 'Stop' }));
        getGameTableObjectData(gameTableObjectId);
    }

    const handlePlayAgain = () => {
        socket.send(JSON.stringify({ flag: 'game start' }));
        getGameTableObjectData(gameTableObjectId);
    }

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

            {/* {isPlaying>0 ? 
            <GameTableInfo
                gameTableData={gameTableData}
                cardDeckData={cardDeckData}
                dealerHandData={dealerHandData}
                playerHandData={playerHandData}
            /> 
            : <Typography>Not Ready</Typography>} */}
            

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
