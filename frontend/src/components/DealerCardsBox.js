import React from 'react';
import {Box, Typography} from "@mui/material";
import card from "../images/cards/card.png";
import Card from './Card';


const DealerCardsBox = ({
    dealerHandData, 
}) => {

    return (
        <Box
        sx={{
            position: "fixed",
            left: "50vw",
            top: "30vh",
            width: '200px',
            height: '200px',
            transform: 'translateX(-100px)',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: '20px',
        }}
        >
            {dealerHandData.cards.map((c, i) => (
                i === 0 ? (
                    null
                ) : i === 1 ? (
                    <Card key={i} index={i} open={true} />
                ) : (
                    <Card key={i} index={i} />
                )
        ))}
        </Box> 
    )
}

export default DealerCardsBox;
