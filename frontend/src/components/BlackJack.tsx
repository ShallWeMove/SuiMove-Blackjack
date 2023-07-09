import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import BackgroundImage from "../images/background.jpg";
import card from "../images/cards/card.png";
import config from "../config.json";
import { useWallet } from '@suiet/wallet-kit';
import {TransactionBlock } from '@mysten/sui.js';
import GameTableInfo from './GameTableInfo';



type Card = {
    suit: string,
    value: number
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
    getGameTableObject, 
    gameTableObjectId, 
    isPlaying,
}) => {
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    const wallet = useWallet();

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


                case 'player card open':
                    setPlayerCards(data.args);
                    break;
                case 'shuffle done':
                    // handle shuffle done
                    break;
                case 'playerFirst done':
                case 'dealerFirst done':
                case 'playerSecond done':
                case 'dealerSecond done':
                    // handle card open
                    break;
                case 'Go done':
                    // handle Go done
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

    const handleGameReady = () => {
        socket.send(JSON.stringify({ flag: 'game ready' }));
        console.log('here is handleGameReady')
        getGameTableObject(gameTableObjectId);
        // gameReady();
    }

    // const gameReady = async() => {
    //     const tx = new TransactionBlock()
    //     const [coin] = tx.splitCoins(tx.gas, [tx.pure(10000)])
    //     tx.setGasBudget(30000000);
    //     tx.moveCall({
    //         target: '0x447b130c2b20c1dba06e268e4e6d265abe2c1d24dad568b124d3b1bd9b7d3025::blackjack::ready_game',
    //         // arguments: [tx.object({Object: {ImmOrOwned:{objectId: "0xfa6cce6584e9a90754a49cf5bfca5a0082f2a44161685287e87d333563286676", version: 465653, digest: "8onXEDVjZqatzhPMaK87SW7r3Lm8C6PTYqYKmSV77GU7`" }}}), tx.object(process.env.GAME_TABLE!), coin],
    //         arguments: [tx.object(process.env.GAME_INFO!), tx.object(process.env.GAME_TABLE!), coin],
    //     });
    //     const result = await wallet.signAndEsetGameTableObjectIdxecuteTransactionBlock({
    //         transactionBlock: tx,
    //     });
    // }

    const handleGameStart = () => {
        socket.send(JSON.stringify({ flag: 'game start' }));
        getGameTableObject(config.GAMETABLE_OBJECT_ID);
    }

    const handleHit = () => {
        socket.send(JSON.stringify({ flag: 'Go' }));
        getGameTableObject(config.GAMETABLE_OBJECT_ID);
    }

    const handleStand = () => {
        socket.send(JSON.stringify({ flag: 'Stop' }));
        getGameTableObject(config.GAMETABLE_OBJECT_ID);
    }

    const handlePlayAgain = () => {
        socket.send(JSON.stringify({ flag: 'game start' }));
        getGameTableObject(config.GAMETABLE_OBJECT_ID);
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
            

            <h3>Player's cards:</h3>
            <ul>
                {playerCards.map((card, i) => (
                    <li key={i}>{`${card.value} of ${card.suit}`}</li>
                ))}
            </ul>

            <h3>Dealer's cards:</h3>
            <ul>
                {dealerCards.map((card, i) => (
                    <li key={i}>{`${card.value} of ${card.suit}`}</li>
                ))}
            </ul>

            {gameOver ? (
                <div>
                    <p>{message}</p>
                    <Button variant="contained" onClick={handlePlayAgain}>Play Again</Button>
                </div>
            ) : (
                <div>
                    {/* <Button variant="contained" onClick={handleGameReady}>Game Ready</Button>
                    <Button variant="contained" onClick={handleGameStart}>Game Start</Button>
                    <Button variant="contained" onClick={handleHit}>Hit</Button>
                    <Button variant="contained" onClick={handleStand}>Stand</Button> */}
                </div>
            )}


            {/* Card Deck */}
            <Box
            sx={{
                position: "fixed",
                right: "5vw",
                top: "30vh",
                width: '200px',
                height: '200px',
                transform: 'translateX(-100px)',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingRight: '15px',
            }}
            >
                {cardDeckData.cards.map((c, i) => (
                    <Box 
                        key={i}
                        sx={{
                            width: '60px',
                            height: '90px',
                            backgroundImage: `url(${card})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transform: `translateX(${-8*i}px) translateY(${3*i}px)`,
                            position: 'absolute',
                            cursor: 'pointer',
                            "&:hover": {
                                transform: `translateX(${-8*i}px) translateY(${3*i}px) scale(1.1)`,
                            }
                        }}
                    />
                ))}
            </Box>
            

            {/* Dealer Cards Box */}
            <Box
            sx={{
                position: "fixed",
                left: "50vw",
                top: "20vh",
                width: '200px',
                height: '200px',
                transform: 'translateX(-100px)',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingRight: '15px',
            }}
            >
                {dealerHandData.cards.length > 0 && dealerHandData.cards[0] && dealerHandData.cards.map((c, i) => (
                    <div 
                        key={i}
                        style={{
                            width: '60px',
                            height: '90px',
                            backgroundImage: `url(${card})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transform: `translateX(${6*i}px) translateY(${-3*i}px)`,
                            position: 'absolute',
                        }}
                    />
                ))}
            </Box>

            {/* Player Cards Box */}
            <Box
            sx={{
                position: "fixed",
                left: "50vw",
                bottom: "15vh",
                width: '200px',
                height: '200px',
                transform: 'translateX(-100px)',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingRight: '15px',
            }}
            >
                {playerHandData.cards.length > 0 && playerHandData.cards[0] && playerHandData.cards.map((c, i) => (
                    <div 
                        key={i}
                        style={{
                            width: '60px',
                            height: '90px',
                            backgroundImage: `url(${card})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transform: `translateX(${6*i}px) translateY(${-3*i}px) rotate(180deg)`,
                            position: 'absolute',
                        }}
                    />
                ))}
            </Box>

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
