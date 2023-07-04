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

export const test = async(signer: RawSigner) => {
    const tx = new TransactionBlock();
    const result = await moveCall('0x35e843c08f42ad01c503bde02a888314c8400696e6752fa4b88aa10db8c132d5::test::new_game', signer, ["vector<vector<u8>>"], [tx.pure([12, 33])])
}

export const startGame = async(signer: RawSigner) => {
    // const result = await moveCall('0x::blackjack::start_game', signer, ['a', 'b'], TransactionArgument[])

    // return result
}

export const shuffle = async(signer: RawSigner) => {
    // // shuffle cards
    // let array = await moveCall('0x::blackjack::get_cards', signer, [a, b], TransactionArgument[]);

    // for (let i = array.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [array[i], array[j]] = [array[j], array[i]]; // array element swapping
    // }

    // await moveCall('0xb::blackjack::shuffle(), signer, [a, b], TransactionArgument[])

    // return "done"
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