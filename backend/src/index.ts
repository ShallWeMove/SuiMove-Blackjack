import WebSocket from 'ws';
import dotenv from "dotenv";
import { getProvider, getSigner, startGame, shuffle, endGame, getCard, test  } from './moveCall';
import { encrypt, decrypt } from './encrypt';

dotenv.config();

const resultt = encrypt(12342);
console.log(resultt)

const provider = getProvider(process.env.RPC_URL!);  
const signer = getSigner(process.env.PRIVATE_KEY!, provider);
const wss = new WebSocket.Server({ port: 8080 });


wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected.');

    ws.on('message', (message: WebSocket.Data) => {
        const data = JSON.parse(message as string);
        const flag = data.flag
        console.log(data)
        console.log(flag)    
        if (flag == 'game start') {
            // game start move call
            const result = startGame(signer)
            // return flag: 'game start done'
        } 
        
        else if (flag == 'player card open') {
            const data = {
                flag: 'player card open',
                args: 'Card Object'
            };
            ws.send(JSON.stringify(data))
        }

        else if (flag == 'shuffle') {
            // card shuffle move call
            const result = shuffle(signer)
            // return flag: 'shuffle done'
        }

        else if (flag == 'card open') {
            // player 1 card open
            const playerFirst = getCard(signer, false)
            // return flag: 'playerFirst done'
            
            // dealer 1 card open
            const dealerFirst = getCard(signer, false)
            // return flag: 'dealerFirst done'

            // player 1 card open
            const playerSecond = getCard(signer, false)
            // return flag: 'playerSecond done'

            // dealer 1 card hide
            const dealerSecond = getCard(signer, true)
            // return flag: 'dealerSecond done'
        }

        else if (flag == 'Go') {
            console.log("Go");
            // player 1 card open
            const playerCard = getCard(signer, false)
            // return flag: 'Go done'
        }

        else if (flag == 'Stop') {
            const result = endGame(signer)
            console.log("Stop");
            // dealer cards open (if necessary)
            // return opened card objects (maybe list)

            // check who is winner
            // return result
            // if player win, transfer sui to player, 
            // if player lose, transfer sui to dealer

            // return flag: 'Stop done' // not yet
        }
        

    });

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});