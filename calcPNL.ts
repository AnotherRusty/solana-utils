import { connection } from "./config"
import { checkRaydium } from "./raydium"

const checkSwap = async (signature: string) => {
  const decoded = await connection.getParsedTransaction(signature, {
    commitment: "finalized",
    maxSupportedTransactionVersion: 1, // optional
  })
  const inx = decoded?.transaction.message.instructions
  console.log('-------------------------------')
  // console.log(inx)
  const raydiumIdx = checkRaydium(inx)
  const signer = decoded?.transaction.message.accountKeys[0].pubkey.toString()
  // console.log(decoded?.meta?.logMessages)
  console.log('-------------------------------')
  const inner_inx = decoded?.meta?.innerInstructions
  // console.log(inner_inx)
  console.log(inner_inx?.map((val, idx) => {
    console.log('idx', idx)
    // if (raydiumIdx == val.index) {
    val.instructions.map((ins, sidx) => {
      // @ts-ignore
      console.log('sidx', sidx, ins.parsed)
    })
    // }
  }))
  // inner_inx?.map((val,idx) => {
  //   if (raydiumIdx == idx) {
  //     console.log(val)
  //   }
  // })
  console.log('-------------------------------')
  // console.log(decoded?.transaction.message.instructions)
  console.log('-------------------------------')
  // console.log(decoded?.transaction.message.accountKeys[0].pubkey.toString())
}

checkSwap('2rpqaZTSQjcAWfWZiM5j9pEjnGZeB7ar1iofEYkCxRNea5hVELcA287azjyDU6f2D5D187uP7SedGjesHoE8uYiw')