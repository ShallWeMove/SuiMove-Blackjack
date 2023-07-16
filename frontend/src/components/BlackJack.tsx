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
    winner,
    setLoading,
}) => {
    const [playerTotal, setPlayerTotal] = useState(0);
    const [dealerTotal, setDealerTotal] = useState(0);

    const wallet = useWallet();

    const [playButtonSound] = useSound('/button_sound.mp3');

    // ----------------------------------------------------------------------------------
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

                case 'end game done':
                    // handle Stop done
                    getGameTableObjectData(gameTableObjectId);
                    console.log("game end done!!!!!");
                    break;

                case 'fill card done':
                    // handle Stop done
                    getGameTableObjectData(gameTableObjectId);
                    console.log("fill card done!!!!!");
                    break;

                case 'cancel ready game done':
                    // handle Stop done
                    getGameTableObjectData(gameTableObjectId);
                    console.log("cancel ready game done!!!!!");
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

    // ----------------------------------------------------------------------------------
    // now this function works!
    const readyGame = async() => {
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

        const stx: Omit<SuiSignAndExecuteTransactionBlockInput,"sui:testnet"> = {
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

    const cancelReadyGame = async() => {
        const tx = new TransactionBlock();
        tx.setGasBudget(30000000);
        const package_id = config.PACKAGE_OBJECT_ID;
        const module = "blackjack"
        const function_name = "cancel_ready_game"
        tx.moveCall({
            target: `${package_id}::${module}::${function_name}`,
            arguments: [tx.object(config.GAME_INFO_OBJECT_ID), tx.object(gameTableObjectId)],
        });

        const stx: Omit<SuiSignAndExecuteTransactionBlockInput,"sui:testnet"> = {
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

    // ----------------------------------------------------------------------------------
    // Socket send flag
    const handleGameReady = async () => {
        if (isPlaying == 0) {
            playButtonSound();

            setLoading(true);
            await readyGame();
            await getGameTableObjectData(gameTableObjectId);
            console.log('game ready done!!!!!')
        }
    }
    const handleCancelGameReady = async () => {
        if (isPlaying == 1) {
            playButtonSound();

            setLoading(true);
            await cancelReadyGame();
            await getGameTableObjectData(gameTableObjectId);
            console.log('cancel game ready done!!!!!')
        }
    }

    const handleGameStart = () => {
        if (isPlaying == 1) {
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
    }

    const handleHit = async () => {
        if (isPlaying == 2) {
            playButtonSound();

            setLoading(true);
            socket.send(JSON.stringify({ 
                flag: 'Go Card',
                packageObjectId: config.PACKAGE_OBJECT_ID,
                gameTableObjectId: gameTableObjectId,
                playerAddress: wallet.address 
            }));
        }
    }

    const handleStand = () => {
        if (isPlaying == 2) {
            setLoading(true);

            playButtonSound();
            socket.send(JSON.stringify({ 
                flag: 'End Game',
                packageObjectId: config.PACKAGE_OBJECT_ID,
                gameTableObjectId: gameTableObjectId,
                playerAddress: wallet.address 
            }));
        } 
    }

    const handleSettleUpGame = () => {
        if (isPlaying == 3) {
            setLoading(true);

            playButtonSound();
            socket.send(JSON.stringify({ 
                flag: 'Settle Up Game',
                packageObjectId: config.PACKAGE_OBJECT_ID,
                gameTableObjectId: gameTableObjectId,
                playerAddress: wallet.address 
            }));
        }
    }

    const handleFillCard = () => {
        setLoading(true);

        playButtonSound();
        socket.send(JSON.stringify({ 
            flag: 'Fill Cards',
            packageObjectId: config.PACKAGE_OBJECT_ID,
            gameTableObjectId: gameTableObjectId,
            playerAddress: wallet.address 
        }));

        setLoading(false);
    }

    // --------------------------------------------------------------------
    console.log("Player Hands: ", playerHandData);

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
            <h2>Game Status : {isPlaying == 0 ? "Not Ready" : isPlaying == 1 ? "Ready" : isPlaying == 2 ? "Playing" : "End"}</h2>
            <h3>Bet Amount : {bettingAmount} SUI</h3>
            {isPlaying == 3 && (winner == 1 ? <h2>Player Win! Congrats!</h2> : <h2>Dealer Win</h2>) }

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
                {isPlaying == 0 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }} onClick={handleGameReady}>Game Ready</Button> : <Box/>}

                {isPlaying == 1 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }} onClick={handleCancelGameReady}>Cancel Ready</Button> : <Box/>}
                {isPlaying == 1 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleGameStart}>Game Start</Button> : <Box/>}
                
                {isPlaying == 2 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleHit}>Hit</Button> : <Box/>}
                {isPlaying == 2 ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleStand}>Stand</Button> : <Box/>}
                
                {isPlaying == 3 ?  <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleSettleUpGame}>Settle Up Game</Button> : <Box/>}
               

                {wallet.address === config.DEALER_ADDRESS ? <Button variant="contained" color='secondary' sx={{ width: '120px', fontWeight: '800' }}onClick={handleFillCard}>Fill Card</Button> : <Box/>}
                
            </Box>
        </Box>
    );
}

export default BlackJack;
