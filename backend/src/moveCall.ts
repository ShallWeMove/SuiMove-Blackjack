import {
    JsonRpcProvider,
    Connection,
    Ed25519Keypair,
    fromB64,
    RawSigner,
    SIGNATURE_SCHEME_TO_FLAG,
    PRIVATE_KEY_SIZE,
    TransactionBlock,
    TransactionArgument
} from "@mysten/sui.js";
import dotenv from "dotenv";
import { version } from "os";
import WebSocket from 'ws';
  
dotenv.config();
  
export const getProvider = (fullnode: string, faucet?: string): JsonRpcProvider => {
    const connection = new Connection({
        fullnode,
        faucet,
    });
    return new JsonRpcProvider(connection);
};

export const getSigner = (
    privateKey: string,
    provider: JsonRpcProvider
): RawSigner => {
    const raw = fromB64(privateKey);
    if (
        raw[0] !== SIGNATURE_SCHEME_TO_FLAG.ED25519 ||
        raw.length !== PRIVATE_KEY_SIZE + 1
    ) {
        throw new Error("invalid key");
    }
  
    const keypair = Ed25519Keypair.fromSecretKey(raw.slice(1));
    return new RawSigner(keypair, provider);
};

const moveCall = async (target: `${string}::${string}::${string}`, signer: RawSigner, argument: TransactionArgument[]) => {
    console.log(target)
    // console.log(typeArgument)
    console.log(argument)
    const tx = new TransactionBlock();
    tx.setGasBudget(parseInt(process.env.GAS_BUDGET!));
    tx.moveCall({
        target: target,
        arguments: argument,
    });
    console.log(tx.blockData)
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log({ result });
    return result;
    // return "Asf" 
};

export const startGame = async(signer: RawSigner, player_address: string, betting_amount: string, package_id:string, game_table_id: string,  ws: WebSocket) => {
    const tx = new TransactionBlock()
    const bettingAmount_mist = Math.floor(parseFloat(betting_amount) * 1000000000)
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(bettingAmount_mist)]);
    tx.setGasBudget(30000000);
    const module = "blackjack"
    const function_name = "start_game"

    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        arguments: [tx.object(game_table_id), coin, tx.pure(player_address)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showInput: true,
        }
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'start game done',
        digest: result.digest,
        effects: result.effects,
        events: result.events,
        objectChanges: result.objectChanges,
        transaction: result.transaction,
    };
    ws.send(JSON.stringify(data))
}

export const getRandomNumbers = () : string[] => {
    const numbers = Array.from({ length: 52 }, (_, index) => (index + 1).toString());
    const selectedNumbers: string[] = [];
    
    while (selectedNumbers.length < 10) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const selectedNumber = numbers.splice(randomIndex, 1)[0];
        selectedNumbers.push(selectedNumber);
    }
    
    const shuffledNumbers: string[] = [];
    
    while (selectedNumbers.length > 0) {
        const randomIndex = Math.floor(Math.random() * selectedNumbers.length);
        const removedNumber = selectedNumbers.splice(randomIndex, 1)[0];
        shuffledNumbers.push(removedNumber);
    }
    
    // console.log("shuffle numbers:", shuffledNumbers);
    return shuffledNumbers;
}

export const fillCardDeck = async(signer: RawSigner, package_id:string, game_table_id: string,  ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(500000000);
    const module = "blackjack"
    const function_name = "fill_10_cards_to_card_deck"

    let shuffle_cards = getRandomNumbers(); 
    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        arguments: [
            tx.object(game_table_id), 
            tx.pure(parseInt(shuffle_cards[0])),
            tx.pure(parseInt(shuffle_cards[1])),
            tx.pure(parseInt(shuffle_cards[2])),
            tx.pure(parseInt(shuffle_cards[3])),
            tx.pure(parseInt(shuffle_cards[4])),
            tx.pure(parseInt(shuffle_cards[5])),
            tx.pure(parseInt(shuffle_cards[6])),
            tx.pure(parseInt(shuffle_cards[7])),
            tx.pure(parseInt(shuffle_cards[8])),
            tx.pure(parseInt(shuffle_cards[9])),
        ],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showInput: true,
        }
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'fill card done',
        digest: result.digest,
        effects: result.effects,
        events: result.events,
        objectChanges: result.objectChanges,
        transaction: result.transaction,
    };
    ws.send(JSON.stringify(data))
}

export const goCard = async(signer: RawSigner, package_id:string, game_table_id:string, player_address: string, ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(30000000);
    const module = "blackjack"
    const function_name = "pass_card_to_player"
    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        arguments: [tx.object(game_table_id), tx.pure(player_address)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showInput: true,
        }
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'get card done',
        digest: result.digest,
        effects: result.effects,
        events: result.events,
        objectChanges: result.objectChanges,
        transaction: result.transaction,
    };
    ws.send(JSON.stringify(data))
}

export const endGame = async(signer: RawSigner, package_id:string, game_table_id:string, ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(30000000);
    const module = "blackjack"
    const function_name = "end_game"
    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        // arguments: [tx.object(game_table_id), tx.pure(1)],
        arguments: [tx.object(game_table_id)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showInput: true,
        }
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'end game (stand) done',
        digest: result.digest,
        effects: result.effects,
        events: result.events,
        objectChanges: result.objectChanges,
        transaction: result.transaction,
    };
    ws.send(JSON.stringify(data))
}

export const settleUpGame = async(signer: RawSigner, package_id:string, game_table_id:string, ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(30000000);
    const module = "blackjack"
    const function_name = "settle_up_game"
    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        // arguments: [tx.object(game_table_id), tx.pure(1)],
        arguments: [tx.object(game_table_id)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showInput: true,
        }
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'settle up game done',
        digest: result.digest,
        effects: result.effects,
        events: result.events,
        objectChanges: result.objectChanges,
        transaction: result.transaction,
    };
    ws.send(JSON.stringify(data))
}
