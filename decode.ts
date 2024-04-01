import { PublicKey } from '@solana/web3.js'
import { connection } from "./config"
import { checkRaydium } from './raydium'

const txHistory = async (address: string) => {
  const requestSignatures = await connection.getSignaturesForAddress(new PublicKey(address))
  const signatures = requestSignatures.map(signature => { if (signature.confirmationStatus == 'finalized') return signature.signature })
  const logs: any[] = []
  let completedCount = 0;
  for (let i = 0; i < signatures.length; i++) {
    if (signatures[i]) {
      // decoding part
      setTimeout(async () => {
        try {
          const decoded = await connection.getParsedTransaction(signatures[i]!, 'finalized')
          console.log(decoded)
          logs.push(decoded?.meta?.logMessages)
        } catch (e) {
        } finally {
          completedCount++;
          if (completedCount === signatures.length) {
          }
        }
      }, i * 500)
      // ----------------------------------------------------------------
    }
  }
}

const decoding = async (signature: string) => {
  const decoded = await connection.getParsedTransaction(signature, {
    commitment: "finalized",
    maxSupportedTransactionVersion: 1, // optional
  })
  const inx = decoded?.transaction.message.instructions
  const raydium = checkRaydium(inx)
  const signer = decoded?.transaction.message.accountKeys[0].pubkey.toString()
  console.log(raydium, signer)
}
