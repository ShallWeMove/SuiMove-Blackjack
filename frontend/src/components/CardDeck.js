import React from 'react';
import {Box} from "@mui/material";
import card from "../images/cards/card.png";


const CardDeck = ({
    cardDeckData, 
    getObject,
}) => {

    return (
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
    )
}

export default CardDeck;
