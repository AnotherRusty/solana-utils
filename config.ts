import {MAINNET_PROGRAM_ID } from '@raydium-io/raydium-sdk'
import { Connection } from '@solana/web3.js'
import dotenv from "dotenv";
dotenv.config();


export const RPC_URL = process.env.RPC!
export const connection = new Connection(RPC_URL)
export const Raydium = MAINNET_PROGRAM_ID.AmmV4
