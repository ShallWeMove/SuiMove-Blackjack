import { Box, Grid, Typography } from "@mui/material"
import config from "../config.json";
import card from "../images/cards/card.png";
import { useEffect, useState } from "react";


const GameTableList = ({
     allGameTables,
     setGameTableObjectId,
     handleGoToGameButtonClick,
     }) => {      

    const [opens, setOpens] = useState([]);

    useEffect(() => {
        setOpens(allGameTables.map((t) => false));
    }, [allGameTables]);

    return allGameTables && (
        <Box
        sx={{
            marginX: "auto",
            width: "50%",
        }}>
            <Typography
            variant="h3"
            sx={{
                textAlign: "center",
                margin: "20px auto",
                fontSize: "30px",
                fontWeight: "800",
            }}
            >Game Table List</Typography>
            <Grid container rowSpacing={3} columnSpacing={1}>
            {allGameTables.map((t, i) => (
                     <Grid key={i} item xs={4}>
                        
                        <Box 
                        onClick={() => {
                            if (t.data.content.fields.is_playing < 1)  {
                                setTimeout(() => {
                                    setGameTableObjectId(t.data.objectId);
                                    handleGoToGameButtonClick(t.data.objectId);
                                }, 1500);
                                setOpens(opens.map((o, j) => i === j ? true : o));
                            }
                        }}
                        sx={{
                            width: '160px',
                            height: '240px',
                            position: 'relative',
                            marginX: 'auto',
                            transformStyle: 'preserve-3d',
                            transformOrigin: 'center',
                            transition: 'transform .5s',
                            transform: `${opens[i] ? `rotateY(180deg) scale(1.1)` : `rotateY(0deg)`}`,
                            "&:hover": {
                                // transform: `rotateY(180deg) scale(1.1)`,
                                transform: `${t.data.content.fields.is_playing >= 1 ? '' : 'scale(1.1)'}`,
                            }
                        }}>
                            {t.data.content.fields.is_playing >= 1 && (
                                <Typography 
                                color='primary'
                                sx={{
                                    zIndex: '15',
                                    position: 'absolute',
                                    left: '10px',
                                    top: '10px',
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    opacity: '0.8',
                                }}>Playing</Typography>
                            )}
                            <Box 
                                    sx={{
                                        zIndex: '10',
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        left: '0',
                                        top: '0',
                                        backgroundImage: `url(${card})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        cursor: `${t.data.content.fields.is_playing < 1 && 'pointer'}`,
                                        backfaceVisibility: 'hidden',
                                        opacity: `${t.data.content.fields.is_playing >= 1 ? '0.3' : '1'}`,
                                    }}
                                />

                                <Box 
                                sx={{
                                    zIndex: '5',
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    left: '0',
                                    top: '0',
                                    background: `url('/img/cards/heart/king.png')`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    transform: `rotateY(180deg)`,
                                    cursor: `${t.data.content.fields.is_playing < 1 && 'pointer'}`,
                                    backfaceVisibility: 'hidden',
                                    opacity: `${t.data.content.fields.is_playing >= 1 ? '0.3' : '1'}`,
                                }}
                                />

                        </Box>

                      
                    </Grid>
            ))}

        </Grid>
        </Box>
        
    )
}

export default GameTableList;