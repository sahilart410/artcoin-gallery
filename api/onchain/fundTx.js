const { cfg, escPda, vaultAuthPda, as32, buildTx, ensureAtaIx, idl, SystemProgram, PublicKey, Connection, anchor } = require('../_lib/onchain');
module.exports=async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');if((req.method||'').toUpperCase()==='OPTIONS')return res.status(200).end();if((req.method||'').toUpperCase()!=='POST')return res.status(405).json({ok:false,error:'Method Not Allowed'});try{
const { rpc, programId, usdtMint } = cfg();
const { buyerPubkey, sellerPubkey } = req.body||{};
if(!buyerPubkey||!sellerPubkey) return res.status(400).json({ ok:false, error:'Missing fields'});
const connection = new Connection(rpc, 'confirmed');
const buyer = new PublicKey(buyerPubkey); const seller = new PublicKey(sellerPubkey);
const [escrow] = escPda(buyer, seller, programId); const [vaultAuth] = vaultAuthPda(escrow, programId);
const program = new anchor.Program(require('../idl/artcoin_escrow.json'), programId, { connection });
const { ata, ix } = await require('../_lib/onchain').ensureAtaIx(connection, buyer, usdtMint);
const vaultAta = require('@solana/spl-token').getAssociatedTokenAddressSync(usdtMint, vaultAuth, true);
const pre = []; if(ix) pre.push(ix);
const ixFund = await program.methods.fund().accounts({ buyer, escrow, usdtMint, buyerAta: ata, vaultAuth, vaultAta,
  tokenProgram: require('@solana/spl-token').TOKEN_PROGRAM_ID, associatedTokenProgram: require('@solana/spl-token').ASSOCIATED_TOKEN_PROGRAM_ID, systemProgram: SystemProgram.programId }).instruction();
const tx = await buildTx([...pre, ixFund], buyer, connection);
const b64 = tx.serialize({ requireAllSignatures:false, verifySignatures:false }).toString('base64');
res.status(200).json({ ok:true, tx:b64, escrow:escrow.toBase58() });
}catch(e){res.status(500).json({ok:false,error:e.message||'Server error'})}};