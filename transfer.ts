
import { Connection, PublicKey, Keypair, Transaction, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction, ComputeBudgetInstruction, ComputeBudgetProgram } from "@solana/web3.js";
import bs58 from 'bs58';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, createTransferInstruction, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { connection } from "./config";
import { BN } from "bn.js";
import { SPL_ACCOUNT_LAYOUT, TokenAccount } from "@raydium-io/raydium-sdk";

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



        const walletTokenAccount = await connection.getTokenAccountsByOwner(keypair.publicKey, {
            programId: TOKEN_PROGRAM_ID
        });
        const tokenAccounts: TokenAccount[] = walletTokenAccount.value.map((j) => ({
            pubkey: j.pubkey,
            programId: j.account.owner,
            accountInfo: SPL_ACCOUNT_LAYOUT.decode(j.account.data)
        }))
        console.log("tokenAccountsinfo ===>", tokenAccounts.length, tokenAccounts);









        // const tokenAccounts = await connection.getParsedTokenAccountsByOwner(keypair.publicKey, { programId: TOKEN_PROGRAM_ID });
        // console.log(tokenAccounts)
        // tokenAccounts.map((tk: any) => {
        //     SPL_ACCOUNT_LAYOUT.decode(tokenActcounts)
        // })
        for (let i = 0; i < tokenAccounts.length; i++) {
            console.log('tokenAccounts', tokenAccounts[i])
            const tokenMint = tokenAccounts[i].accountInfo.mint
            const balance = tokenAccounts[i].accountInfo.amount
            // if (balance == BigInt(0)) continue
            console.log("balance", balance, typeof balance)
            const destTokenAccount = await getAssociatedTokenAddress(new PublicKey(tokenMint), new PublicKey(dest))
            const createAtaInstruction = createAssociatedTokenAccountInstruction(keypair.publicKey, destTokenAccount, new PublicKey(dest), new PublicKey(tokenMint))

            const transaction = new Transaction().add(
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 400_0000 }),
                createAtaInstruction,
                createTransferInstruction(
                    keypair.publicKey,
                    new PublicKey(destTokenAccount),
                    keypair.publicKey,
                    BigInt((balance).toString()),
                ))
            transaction.feePayer = keypair.publicKey;
            const recentBlockhash = await connection.getLatestBlockhash()
            transaction.recentBlockhash = recentBlockhash.blockhash;
            console.log(await connection.simulateTransaction(transaction))
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

// export const depositToken = async (wallet: WalletContextState, connection: Connection, depositAmount: number) => {
//     try {
//         if (!wallet || !wallet.publicKey) {
//             console.log("Wallet not connected")
//             return { signature: '', tokenBalance: 0 }
//         }

//         const sourceAccount = await getAssociatedTokenAddress(
//             tokenMint,
//             wallet.publicKey
//         );

//         const mintInfo = await connection.getParsedAccountInfo(tokenMint)
//         if (!mintInfo.value) throw new Error("Token info error")

//         // @ts-ignore
//         const numberDecimals = mintInfo.value.data.parsed!.info.decimals;

//         // create tx
//         const tx = new Transaction();
//         // send token
//         tx.add(createTransferInstruction(
//             sourceAccount,
//             tresuryTokenAccount,
//             wallet.publicKey,
//             depositAmount * Math.pow(10, numberDecimals)
//         ))
//             // send sol
//             .add(
//                 SystemProgram.transfer({
//                     fromPubkey: wallet.publicKey,
//                     toPubkey: new PublicKey(treasury),
//                     lamports: fee * LAMPORTS_PER_SOL,
//                 })
//             );
//         // tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
//         // tx.feePayer = wallet.publicKey
//         // wallet.signTransaction(tx)

//         // send and confirm
//         const signature = await wallet.sendTransaction(tx, connection);
//         await connection.confirmTransaction(signature, "confirmed");

//         const log = `\x1b[32mTransaction Success!🎉\nhttps://solscan.io/tx/${signature}`
//         console.log(log)
//         const tokenBalance = await getTokenBalance(wallet, connection);

//         return { signature: signature, tokenBalance: tokenBalance }
//     } catch (e) {
//         console.warn(e)
//         return { signature: '', tokenBalance: 0 }
//     }
// }

// export const getTokenBalance = async (wallet: WalletContextState, connection: Connection) => {
//     try {
//         if (!wallet.publicKey) {
//             console.log("Wallet not connected")
//             return undefined
//         }
//         const sourceAccount = await getAssociatedTokenAddress(
//             tokenMint,
//             wallet.publicKey
//         );

//         const info = await connection.getTokenAccountBalance(sourceAccount);
//         if (info.value.uiAmount == null) throw new Error('No balance found');

//         return info.value.uiAmount;
//     } catch (e) {
//         return 0
//     }
// }


// export const gather = async () => {

//     let data: DataType[] = []
//     let pairs: PairType[] = []
//     await fetchData()
  
//     if (!data) {
//       console.log("No data")
//       return
//     }
//     let keypairs: Keypair[] = []
//     for (let i = 0; i < data.length; i++) {
//       try {
//         const key = Keypair.fromSecretKey(base58.decode(data[i].key))
//         keypairs.push(key)
//       } catch (error) {
//         console.log("Error in loading key ", data[i].key, " \n\tIts type: ", data[i].key_type, " pubkey: ", data[i].pub)
//       }
//     }
//     const kpNum = keypairs.length;
//     const numToAux = kpNum / 10 < 5 ? 5 : Math.round(kpNum / 10)
//     console.log("🚀 ~ gather ~ numToAux:", numToAux)
//     const numToMainKey = kpNum - numToAux
//     console.log("🚀 ~ gather ~ numToMainKey:", numToMainKey)
  
//     const mainKp = new Keypair()
//     console.log("🚀 ~ gather ~ mainKp:", base58.encode(mainKp.secretKey))
//     const auxKp = new Keypair()
//     console.log("🚀 ~ gather ~ auxKp:", base58.encode(auxKp.secretKey))
//     let feepayer: Keypair | null = null
//     //transfer sol part
//     let index = 0, errorNum = 0, errorInOne = 0
//     const ixs: TransactionInstruction[] = []
//     for (index = 0; index < kpNum; index++) {
//       try {
//         console.log("🚀sol transfer~ index:", index)
//         let balance = await connection.getBalance(keypairs[index].publicKey)
//         console.log("🚀 ~ gather ~ balance:", balance)
//         if (balance > 10 ** 7) {
//           if (!feepayer)
//             feepayer = keypairs[index]
//           const transferInstruction = SystemProgram.transfer({
//             fromPubkey: keypairs[index].publicKey,
//             toPubkey: numToMainKey <= index ? mainKp.publicKey : auxKp.publicKey,
//             lamports: balance - 10 ** 7
//           })
//           // await sendAndConfirmTransaction(connection, transferTransaction, [keypairs[index]], { commitment: "confirmed" });
//           ixs.push(transferInstruction)
//         }
//       } catch (error) {
//         console.log("error in sending sol in wallet number: ", index + 1, error)
//         errorNum += 1
//       }
//     }
//     const result: VersionedTransaction[] = []
//     const batchSize = 10
//     const numTransactions = Math.ceil(ixs.length / 10);
//     for (let i = 0; i < numTransactions; i++) {
//       let blockhash = await connection
//         .getLatestBlockhash()
//         .then((res: any) => res.blockhash);
//       let bulkTransaction: TransactionInstruction[] = [];
  
//       let lowerIndex = i * batchSize;
//       let upperIndex = (i + 1) * batchSize;
//       for (let j = lowerIndex; j < upperIndex; j++) {
//         if (ixs[j]) bulkTransaction.push(ixs[j]);
//       }
//       if (!feepayer) return
//       const messageV0 = new TransactionMessage({
//         payerKey: feepayer.publicKey,
//         recentBlockhash: blockhash,
//         instructions: bulkTransaction,
//       }).compileToV0Message();
//       const transaction = new VersionedTransaction(messageV0);
//       transaction.sign([feepayer]);
//       result.push(transaction);
//     }
//     try {
//       await bundle(result, feepayer!)
//     } catch (error) {
//       console.log("🚀 ~ gather ~ error:", error)
//     }
//     console.log("XXX arrived")
  
  
//     //get token account info from wallets
//     let tokenAccountsArr = []
  
//     for (let i = 0; i < kpNum; i++) {
//       try {
//         const walletTokenAccount = await connection.getTokenAccountsByOwner(keypairs[i].publicKey, {
//           programId: TOKEN_PROGRAM_ID
//         });
//         const tokenAccountsInfo: TokenAccount[] = walletTokenAccount.value.map((j) => ({
//           pubkey: j.pubkey,
//           programId: j.account.owner,
//           accountInfo: SPL_ACCOUNT_LAYOUT.decode(j.account.data)
//         }))
//         console.log("tokenAccountsinfo ===>", tokenAccountsInfo.length, tokenAccountsInfo);
//         tokenAccountsArr.push(tokenAccountsInfo)
//       } catch (error) {
//         try {
//           const walletTokenAccount = await connection.getTokenAccountsByOwner(keypairs[i].publicKey, {
//             programId: TOKEN_PROGRAM_ID
//           });
//           const tokenAccountsInfo: TokenAccount[] = walletTokenAccount.value.map((k) => ({
//             pubkey: k.pubkey,
//             programId: k.account.owner,
//             accountInfo: SPL_ACCOUNT_LAYOUT.decode(k.account.data)
//           }))
//           console.log("tokenAccountsinfo ===>", tokenAccountsInfo.length, tokenAccountsInfo);
//           tokenAccountsArr.push(tokenAccountsInfo)
//         } catch (error) {
//           console.log(error, "error in getting token accounts")
//           tokenAccountsArr.push(tokenAccountsArr[tokenAccountsArr.length - 1])
//         }
//       }
//     }
  
  
  
//     //token transfer part
//     let i = 0, j = 0, errOccured = 0
//     while (true) {
//       for (i = 0; i < tokenAccountsArr.length; i++) {
//         try {
//           console.log("🚀 ~ transfer ~ i:", i)
//           const transaction = new Transaction()
//           const tokenAcc = tokenAccountsArr[i]
//           for (j = 0; j < tokenAcc.length; j++) {
//             const accInfo = tokenAcc[j]
//             const tokenBalance = accInfo.accountInfo.amount
//             const destAta = await getOrCreateAssociatedTokenAccount(
//               connection,
//               mainKp,
//               accInfo.accountInfo.mint,
//               mainKp.publicKey
//             )
//             console.log("🚀 ~ gather ~ destAta:", destAta)
//             const sourceAta = accInfo.pubkey
//             transaction.add(
  
//               createTransferInstruction(
//                 sourceAta,
//                 destAta.address,
//                 accInfo.accountInfo.owner,
//                 tokenBalance.toNumber(),
//               )
//             );
//           }
//           await sendAndConfirmTransaction(connection, transaction, [mainKp, keypairs[i]], { commitment: "confirmed" });
//         } catch (error) {
//           console.log("error in sending token in number ", i + 1, " wallet", error)
//           errOccured += 1
//           if (errOccured % 3 == 1) i++
//         }
//       }
//       console.log("XX arrived here")
//       if (i >= tokenAccountsArr.length - 1 || errOccured > 50) break;
//     }
  
  
  
//     console.log("XXXXXXXXXXXXXXXX main ", base58.encode(mainKp.secretKey))
//     console.log("======================= aux ", base58.encode(auxKp.secretKey))
//     console.log("main", await connection.getBalance(mainKp.publicKey))
//     console.log("aux", await connection.getBalance(mainKp.publicKey))
//     const mainT = await connection.getTokenAccountsByOwner(mainKp.publicKey, {
//       programId: TOKEN_PROGRAM_ID
//     })
//     const mainA = await connection.getTokenAccountsByOwner(auxKp.publicKey, {
//       programId: TOKEN_PROGRAM_ID
//     })
//     const tokenAccountsInfoM: TokenAccount[] = mainT.value.map((j) => ({
//       pubkey: j.pubkey,
//       programId: j.account.owner,
//       accountInfo: SPL_ACCOUNT_LAYOUT.decode(j.account.data)
//     }))
//     const tokenAccountsInfoA: TokenAccount[] = mainA.value.map((j) => ({
//       pubkey: j.pubkey,
//       programId: j.account.owner,
//       accountInfo: SPL_ACCOUNT_LAYOUT.decode(j.account.data)
//     }))
//     console.log("MainAccountsinfo ===>", tokenAccountsInfoM.length, tokenAccountsInfoM);
//     console.log("AuxAccountsinfo ===>", tokenAccountsInfoA.length, tokenAccountsInfoA);
//     const jsonData = JSON.stringify({
//       main: base58.encode(mainKp.secretKey),
//       aux: base58.encode(auxKp.secretKey)
//     })
//     saveDataToFile("./keys1.json", jsonData)
//   }
  