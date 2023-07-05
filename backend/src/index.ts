import WebSocket from 'ws';
import dotenv from "dotenv";
import { getProvider, getSigner, startGame, gameReady, endGame, getCard } from './moveCall';
// import { encrypt, decrypt } from './encrypt';

dotenv.config();

// const resultt = encrypt(12342);
// console.log(resultt)

const provider = getProvider(process.env.RPC_URL!);  
const signer = getSigner(process.env.PRIVATE_KEY!, provider);
const wss = new WebSocket.Server({ port: 8080 });

// console.log(result)

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected.');

    ws.on('message', (message: WebSocket.Data) => {
        const data = JSON.parse(message as string);
        const flag = data.flag
        console.log(data)
        console.log(flag)    
        if (flag == 'game start') {
            // game start move call
            const address = data.address
            const result = startGame(signer, address, ws)
            // return flag: 'game start done'
        } 

        else if (flag == 'game ready') {
            // card shuffle move call
            const result = gameReady(signer, ws)
            // return flag: 'shuffle done'
        }

        else if (flag == 'Go') {
            console.log("Go");
            // player 1 card open
            const playerCard = getCard(signer, ws)
            // return flag: 'Go done'
        }

        else if (flag == 'Stop') {
            const result = endGame(signer)
            console.log("Stop");
        }
        

    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});
