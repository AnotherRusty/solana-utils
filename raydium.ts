import { ParsedInstruction, PartiallyDecodedInstruction } from "@solana/web3.js"
import { Raydium } from "./config"

export const checkRaydium = (inx: (ParsedInstruction | PartiallyDecodedInstruction)[] | undefined) => {
  if (inx && inx.length) {
    for (let i = 0; i < inx.length; i++) {
      // console.log(inx[i].programId.toBase58(), Raydium.toBase58())
      if (inx[i].programId.toBase58() == Raydium.toBase58()) {
        console.log(i)
        return i
      }
    }
    return false
  }
  return false
}
