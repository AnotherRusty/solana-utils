import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58';
import * as fs from 'fs'

import { connection } from './config'

const random = async () => {
    const keyPair = new Keypair()
    const publicKey = keyPair.publicKey;
    const privateKey = bs58.encode(Buffer.from(keyPair.secretKey))
    const balance = (await connection.getBalance(publicKey))
    if (balance > 0) {
        fs.appendFileSync('address.txt', privateKey + '\n')
    }
}

const fromHexString = async(privateKeyHex:string) => {
    // const privateKey = bs58.encode(Buffer.from(keyPair.secretKey))
    const keypair = Keypair.fromSecretKey(
        bs58.decode(privateKeyHex)
    )
    console.log(keypair, keypair.publicKey,keypair.secretKey)
}
















fromHexString("5ajUGkHdgd5EGkjWmz9cUHTGDWgFvBaVwby1D2ChAmamsjtQuwQQRyToQjrmTzkkfxqo4TXMZmo8Hf97A4kjwYPN")