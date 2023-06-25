import { useWallet } from '@suiet/wallet-kit';
import * as tweetnacl from 'tweetnacl';
import { ConnectButton, ErrorCode } from "@suiet/wallet-kit";
import { useEffect, useState } from 'react';
import "@suiet/wallet-kit/style.css";
import "./suiet-wallet-kit-custom.css";

function WalletButton() {

    const wallet = useWallet();

    useEffect(() => {
        if (wallet.status == 'connected') {
            console.log('wallet status', wallet.status)
            console.log('wallet name', wallet.name)
            console.log('wallet address', wallet.account.address)
        } else {
            console.log('wallet status', wallet.status)
        }
    }, [wallet.connected])

    return (
        <ConnectButton
            // The BaseError instance has properties like {code, message, details}
            // for developers to further customize their error handling.
            onConnectError={(err) => {
                if (err.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
                    console.warn('user rejected the connection to ' + err.details?.wallet);
                } else {
                    console.warn('unknown connect error: ', err);
                }
            }}
        >Connect Your Wallet</ConnectButton>
    );
}

export default WalletButton;