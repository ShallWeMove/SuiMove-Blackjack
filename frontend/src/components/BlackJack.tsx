import React, { useState, useEffect } from 'react';
import { Box, Button } from '@mui/material';

type Card = {
    suit: string,
    value: number
};

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]; // values for 2-10, J, Q, K

const getCard = (): Card => {
    const suit = suits[Math.floor(Math.random() * 4)];
    const value = values[Math.floor(Math.random() * 13)];
    return { suit, value };
}

const calculateScore = (cards: Card[]): number => {
    return cards.reduce((score, card) => score + card.value, 0);
}

const BlackJack: React.FC<{ resetGame: () => void }> = ({ resetGame }) => {
    const [playerCards, setPlayerCards] = useState<Card[]>([getCard(), getCard()]);
    const [dealerCards, setDealerCards] = useState<Card[]>([getCard()]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (calculateScore(playerCards) > 21) {
            setGameOver(true);
            setMessage('Player busted! Dealer wins.');
        }
    }, [playerCards]);

    const handleHit = () => {
        setPlayerCards(prev => [...prev, getCard()]);
    }

    const handleStand = () => {
        let newDealerCards = [...dealerCards];
        while (calculateScore(newDealerCards) < 17) {
            newDealerCards.push(getCard());
        }
        setDealerCards(newDealerCards);
        setGameOver(true);
    }

    const handlePlayAgain = () => {
        resetGame();
    }

    useEffect(() => {
        const playerScore = calculateScore(playerCards);
        const dealerScore = calculateScore(dealerCards);
        if (gameOver) {
            if (!message) {
                if (dealerScore > 21) {
                    setMessage('Dealer busted! Player wins.');
                } else if (playerScore > dealerScore) {
                    setMessage('Player wins!');
                } else {
                    setMessage('Dealer wins!');
                }
            }
        }
    }, [gameOver, playerCards, dealerCards, message]);

    return (
        <Box>
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
        </Box>
    );
}

export default BlackJack;
