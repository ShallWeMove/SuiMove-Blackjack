import React from 'react';
import { Typography, Box} from "@mui/material";

const GameTableInfo = ({
    gameTableData, 
    cardDeckData, 
    dealerHandData, 
    playerHandData, 
}) => {

    return (
        <Box>
            <Typography>dealer hand : {gameTableData.dealer_hand} total card : {dealerHandData.total_cards_number}</Typography>
            <Typography>dealer cards</Typography>
            {dealerHandData.cards.map((card)=>(<Typography>{card}</Typography>))}

            <Typography>player hand : {gameTableData.player_hand} total card : {playerHandData.total_cards_number}</Typography>
            <Typography>player cards</Typography>
            {playerHandData.cards.map((card)=>(<Typography>{card}</Typography>))}

            <Typography>card deck : {gameTableData.card_deck} total card : {cardDeckData.total_cards_number}</Typography>
            <Typography>card deck cards</Typography>
            {cardDeckData.cards.map((card)=>(<Typography>{card}</Typography>))}
        </Box>
    )
}

export default GameTableInfo;
