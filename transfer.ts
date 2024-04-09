
import { Connection, PublicKey, Keypair, Transaction, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from 'bs58';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, createTransferInstruction } from "@solana/spl-token";
import { connection } from "./config";

const sendSol = async (privKey: string, destination: string) => {
    const keypair = Keypair.fromSecretKey(
        bs58.decode(privKey)
    )

    const balance = await connection.getBalance(keypair.publicKey);
    // Add transfer instruction to transaction
    const userWalletPK = new PublicKey(destination);
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: userWalletPK,
            lamports: balance,
        })
    );
    const recentBlockhash = await connection.getLatestBlockhash()
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = keypair.publicKey

    // Sign transaction, broadcast, and confirm
    const simulator = await connection.simulateTransaction(transaction)
    console.log('simulator => ', simulator)
    while (true) {
        try {
            const txid = await connection.sendTransaction(transaction, [keypair])
            await connection.confirmTransaction(txid, "confirmed")
            return txid
        } catch (e) {
            console.warn(`${userWalletPK} -> ${e}`)
        }
    }
}

const sendToken = async (privKey: string, dest: string) => {
    try {

        const keypair = Keypair.fromSecretKey(
            bs58.decode(privKey)
        )

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, { programId: TOKEN_PROGRAM_ID });
        for (let i = 0; i < tokenAccounts.value.length; i++) {
            console.log('tokenAccounts', tokenAccounts.value[i])
            const tokenMint = tokenAccounts.value[i].pubkey.toBase58()
            const balance = tokenAccounts.value[i].account.data.parsed.info.tokenAmount
            const destTokenAccount = await getOrCreateAssociatedTokenAccount(connection, keypair, new PublicKey(tokenMint), new PublicKey(dest))
            const transaction = new Transaction().add(
                createTransferInstruction(
                    keypair.publicKey,
                    new PublicKey(destTokenAccount),
                    keypair.publicKey,
                    balance,
                ))
            transaction.feePayer = keypair.publicKey;
            const recentBlockhash = await connection.getLatestBlockhash()
            transaction.recentBlockhash = recentBlockhash.blockhash;
            // const simulator = await connection.simulateTransaction(transaction)
            // console.log(simulator)
            const signedTransaction = await connection.sendTransaction(transaction, [keypair]);
            const tx = await connection.confirmTransaction(signedTransaction, "confirmed")
            console.log(signedTransaction)
        };

    } catch (error) {
        console.log("Withdraw err ====> ", error);
    }
}

sendToken('5ajUGkHdgd5EGkjWmz9cUHTGDWgFvBaVwby1D2ChAmamsjtQuwQQRyToQjrmTzkkfxqo4TXMZmo8Hf97A4kjwYPN', 'EKPvijFQy1yZJdEXr7kHDTc3dAoJGX5SAkNBvLKhV9p6')