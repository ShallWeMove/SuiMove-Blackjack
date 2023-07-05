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
import WebSocket from 'ws';
// import { decrypt } from './encrypt';
  
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


export const startGame = async(signer: RawSigner, address: string, ws: WebSocket) => {
    // const result = await moveCall('0x::blackjack::start_game', signer, ['a', 'b'], TransactionArgument[])

    // return result
    const tx = new TransactionBlock()
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(10000)]);
    tx.setGasBudget(parseInt(process.env.GAS_BUDGET!));
    tx.moveCall({
        target: '0x447b130c2b20c1dba06e268e4e6d265abe2c1d24dad568b124d3b1bd9b7d3025::blackjack::start_game',
        arguments: [coin, tx.object(process.env.GAME_TABLE!), tx.pure(address)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'start game done',
    };
    ws.send(JSON.stringify(data))
}

export const gameReady = async(signer: RawSigner, ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(parseInt(process.env.GAS_BUDGET!));
    tx.moveCall({
        target: '0x447b130c2b20c1dba06e268e4e6d265abe2c1d24dad568b124d3b1bd9b7d3025::blackjack::create_game_table',
        arguments: [tx.object(process.env.GAME_INFO!)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'game ready done',
    };
    ws.send(JSON.stringify(data))
}

export const getCard = async(signer: RawSigner, ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(parseInt(process.env.GAS_BUDGET!));
    tx.moveCall({
        target: '0x447b130c2b20c1dba06e268e4e6d265abe2c1d24dad568b124d3b1bd9b7d3025::blackjack::go_card',
        arguments: [tx.object(process.env.GAME_TABLE!)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'start game done',
    };
    ws.send(JSON.stringify(data))
}

export const endGame = async(signer: RawSigner) => {
    // const result = await moveCall('0x::blackjack::end_game', signer, ['a', 'b'], TransactionArgument[])

    // return result
}
