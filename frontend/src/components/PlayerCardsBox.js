import React from 'react';
import {Box, Typography} from "@mui/material";
import card from "../images/cards/card.png";


const PlayerCardsBox = ({
    playerHandData, 
    getObject,
}) => {

    return (
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
            {playerHandData.cards.map((c, i) => (
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
            {/* <ul>
                {playerHandData.cards.map((c, i) => {
                    return <Typography key={i}>{c}</Typography>
                })}
            </ul> */}
        </Box> 
    )
}

export default PlayerCardsBox;
