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

while (true) {
  setTimeout(async () => {
    await random()
  }, 1000);
}