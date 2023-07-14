import React from 'react';
import { Box } from "@mui/material";
import Card from './Card';


const PlayerCardsBox = ({
    playerHandData, 
}) => {

    const types = ["heart", "spade", "diamond", "clover"];

    return (
        <Box
        sx={{
            position: "fixed",
            left: "50vw",
            bottom: "15vh",
            marginX: 'auto',
            width: '1200px',
            height: '200px',
            transform: 'translateX(-600px)',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: '20px',
        }}
        >
            {playerHandData.cards.map((c, i) => (
                    <Card key={i} index={i} open={true} type={types[i%4]} num={i+2} />
            ))}
        </Box> 
    )
}

export default PlayerCardsBox;
