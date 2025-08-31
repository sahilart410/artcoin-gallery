const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Transaction, SystemProgram } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const idl = require('../idl/artcoin_escrow.json');

function cfg(){
  return {
    rpc: process.env.RPC_URL || 'https://api.devnet.solana.com',
    programId: new PublicKey(process.env.PROGRAM_ID || 'ArtCoinEscrow1111111111111111111111111111111'),
    usdtMint: new PublicKey(process.env.USDT_MINT || 'Es9vMFrzaCERZ8XhHk7A9G1x1VQ9v6wY5xZk1Z5hK5eR'),
  };
}
function escPda(buyer, seller, programId){ return PublicKey.findProgramAddressSync([Buffer.from('escrow'), buyer.toBuffer(), seller.toBuffer()], programId); }
function vaultAuthPda(escrow, programId){ return PublicKey.findProgramAddressSync([Buffer.from('vault'), escrow.toBuffer()], programId); }
async function recentBlockhash(connection){ const { blockhash } = await connection.getLatestBlockhash('finalized'); return blockhash; }
function as32(hex){ const b = Buffer.from(hex.replace(/^0x/,'').padStart(64,'0'),'hex'); if(b.length!==32) throw new Error('tracking hash must be 32 bytes'); return Array.from(b); }
async function buildTx(instructions, feePayer, connection){ const tx = new Transaction(); instructions.forEach(ix=>tx.add(ix)); tx.feePayer=feePayer; tx.recentBlockhash = await recentBlockhash(connection); return tx; }
async function ensureAtaIx(connection, owner, mint){
  const ata = getAssociatedTokenAddressSync(mint, owner);
  const info = await connection.getAccountInfo(ata);
  if (info) return { ata, ix: null };
  const ix = createAssociatedTokenAccountInstruction(owner, ata, owner, mint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  return { ata, ix };
}
module.exports = { cfg, escPda, vaultAuthPda, as32, buildTx, ensureAtaIx, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, idl, SystemProgram, PublicKey, Connection, anchor };
