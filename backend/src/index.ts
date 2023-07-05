import WebSocket from 'ws';
import dotenv from "dotenv";
import { getProvider, getSigner, startGame, gameReady, endGame, getCard } from './moveCall';
// import { encrypt, decrypt } from './encrypt';

dotenv.config();

// const resultt = encrypt(12342);
// console.log(resultt)

const provider = getProvider(process.env.RPC_URL!);  
const dealer_signer = getSigner(process.env.DEALER_PRIVATE_KEY!, provider);
const player_signer = getSigner(process.env.PLAYER_PRIVATE_KEY!, provider);
// need dealer private key
const player_address = process.env.PLAYER_ADDRESS!
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
            // const address = data.address
            // need dealer address
            // const address = "0xdd235ff1e61e1d6f204eb567d1b4b5eca752dc2ce05d8bb23ccb82654f76c8ce"
            const result = startGame(dealer_signer, player_address, ws);
            // console.log("Game start done?")
            // return flag: 'game start done'
        } 

        else if (flag == 'game ready') {
            // card shuffle move call
            const result = gameReady(player_signer, ws)
            // return flag: 'shuffle done'
        }

        else if (flag == 'Go') {
            console.log("Go");
            // player 1 card open
            const playerCard = getCard(dealer_signer, ws)
            // return flag: 'Go done'
        }

        else if (flag == 'Stop') {
            const result = endGame(dealer_signer)
            console.log("Stop");
        }
        

    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});
