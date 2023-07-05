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
import { decrypt } from './encrypt';
  
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

const moveCall = async (target: `${string}::${string}::${string}`, signer: RawSigner, typeArgument: string[], argument: TransactionArgument[]) => {
    const tx = new TransactionBlock();
    tx.setGasBudget(parseInt(process.env.GAS_BUDGET!));
    tx.moveCall({
        target: target,
        arguments: argument,
        typeArguments: typeArgument
    });
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });
    console.log({ result });
    return result;
};


export const startGame = async(signer: RawSigner) => {
    // const result = await moveCall('0x::blackjack::start_game', signer, ['a', 'b'], TransactionArgument[])

    // return result
}

export const gameReady = async(signer: RawSigner) => {
    // const result = await moveCall('0x::blackjack::game_ready', signer, ['a', 'b'], TransactionArgument[])

    // return result
}

export const getCard = async(signer: RawSigner, ishidden: boolean) => {
    if(ishidden) {
        // const result = await moveCall('0x::blackjack::get_card', signer, ['a', 'b'], TransactionArgument[])
        
        // return result
    }
    else {
        // const result = await moveCall('0x::blackjack::get_card', signer, ['a', 'b'], TransactionArgument[])
        // const num = decrypt(result)
        // return num
    }
}

export const endGame = async(signer: RawSigner) => {
    // const result = await moveCall('0x::blackjack::end_game', signer, ['a', 'b'], TransactionArgument[])

    // return result
}
