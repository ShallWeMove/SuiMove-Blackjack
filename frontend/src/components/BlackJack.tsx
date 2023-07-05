import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import BackgroundImage from "../images/background.jpg";
import card from "../images/cards/card.png";

type Card = {
    suit: string,
    value: number
};

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]; // values for 2-10, J, Q, K

// Create a WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

const BlackJack: React.FC = () => {
    const [playerCards, setPlayerCards] = useState<Card[]>([]);
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    // Handle incoming WebSocket messages
    useEffect(() => {
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.flag) {
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
        socket.send(JSON.stringify({ flag: 'game start' }));
    }, []);

    const handleHit = () => {
        socket.send(JSON.stringify({ flag: 'Go' }));
    }

    const handleStand = () => {
        socket.send(JSON.stringify({ flag: 'Stop' }));
    }

    const handlePlayAgain = () => {
        socket.send(JSON.stringify({ flag: 'game start' }));
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
            <h2>Blackjack Game</h2>

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
                    <Button variant="contained" onClick={handleHit}>Hit</Button>
                    <Button variant="contained" onClick={handleStand}>Stand</Button>
                </div>
            )}

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
                <div 
                    style={{
                        width: '60px',
                        height: '90px',
                        backgroundImage: `url(${card})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'absolute',
                        transform: 'rotate(180deg)',
                    }}
                />
                <div 
                    style={{
                        width: '60px',
                        height: '90px',
                        backgroundImage: `url(${card})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'translateX(-10px) translateY(-5px) rotate(180deg)',
                        position: 'absolute',
                    }}
                />
                <div 
                    style={{
                        width: '60px',
                        height: '90px',
                        backgroundImage: `url(${card})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'translateX(-20px) translateY(-10px) rotate(180deg)',
                        position: 'absolute',
                    }}
                />
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
                <div 
                    style={{
                        width: '60px',
                        height: '90px',
                        backgroundImage: `url(${card})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'absolute',
                    }}
                />
                <div 
                    style={{
                        width: '60px',
                        height: '90px',
                        backgroundImage: `url(${card})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'translateX(10px) translateY(-5px)',
                        position: 'absolute',
                    }}
                />
                <div 
                    style={{
                        width: '60px',
                        height: '90px',
                        backgroundImage: `url(${card})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: 'translateX(20px) translateY(-10px)',
                        position: 'absolute',
                    }}
                />
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
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}>Get Card</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}>Ready</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}>Shuffle</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}>Start</Button>
                <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}>Stop</Button>
            </Box>
        </Box>
    );
}

export default BlackJack;
