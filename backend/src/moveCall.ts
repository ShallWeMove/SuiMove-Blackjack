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


export const startGame = async(signer: RawSigner, address: string, betting_amount: string, package_id:string, game_table_id: string,  ws: WebSocket) => {
    const tx = new TransactionBlock()
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(parseInt(betting_amount))]);
    tx.setGasBudget(30000000);
    const module = "blackjack"
    const function_name = "start_game"

    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        arguments: [tx.object(game_table_id), coin, tx.pure(address)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'start game done',
        digest: result.digest,
    };
    ws.send(JSON.stringify(data))
}

export const goCard = async(signer: RawSigner, package_id:string, game_table_id:string, ws: WebSocket) => {
    const tx = new TransactionBlock()
    tx.setGasBudget(30000000);
    const module = "blackjack"
    const function_name = "go_card"
    tx.moveCall({
        target: `${package_id}::${module}::${function_name}`,
        arguments: [tx.object(game_table_id), tx.pure(1)],
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log(result.objectChanges);
    const data = {
        flag: 'get card done',
        digest: result.digest,
    };
    ws.send(JSON.stringify(data))
}

export const endGame = async(signer: RawSigner, package_id:string, game_table_id:string, ws: WebSocket) => {
    // const tx = new TransactionBlock()
    // tx.setGasBudget(30000000);
    // const module = "blackjack"
    // const function_name = "stop"
    // tx.moveCall({
    //     target: `${package_id}::${module}::${function_name}`,
    //     // arguments: [tx.object(game_table_id), tx.pure(1)],
    //     arguments: [tx.object(game_table_id), tx.pure(1)],
    // });
    // const result = await signer.signAndExecuteTransactionBlock({
    //     transactionBlock: tx,
    // });
    // console.log(result.objectChanges);
    const data = {
        flag: 'stop game done',
    };
    ws.send(JSON.stringify(data))
}
