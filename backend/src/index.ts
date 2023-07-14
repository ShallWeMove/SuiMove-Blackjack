import WebSocket from 'ws';
import dotenv from "dotenv";
import { getProvider, getSigner, startGame, endGame, goCard } from './moveCall';

dotenv.config();

const provider = getProvider(process.env.RPC_URL!);  
const dealer_signer = getSigner(process.env.DEALER_PRIVATE_KEY!, provider);

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected.');

    ws.on('message', (message: WebSocket.Data) => {
        const data = JSON.parse(message as string);
        const flag = data.flag
        const package_id = data.packageObjectId;
        const game_table_id = data.gameTableObjectId;
        const player_address = data.playerAddress;
        console.log("data: ",data)
        console.log("flag: ", flag)    
        if (flag == 'Start Game') {
            startGame(dealer_signer, player_address, package_id, game_table_id, ws);
        } 

        else if (flag == 'Go Card') {
            goCard(dealer_signer, package_id, game_table_id, player_address, ws)
        }

        else if (flag == 'Stop Game') {
            endGame(dealer_signer, package_id, game_table_id, ws)
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});
