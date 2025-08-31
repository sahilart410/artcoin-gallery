const { cfg, escPda, vaultAuthPda, as32, buildTx, ensureAtaIx, idl, SystemProgram, PublicKey, Connection, anchor } = require('../_lib/onchain');
module.exports=async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');if((req.method||'').toUpperCase()==='OPTIONS')return res.status(200).end();if((req.method||'').toUpperCase()!=='POST')return res.status(405).json({ok:false,error:'Method Not Allowed'});try{
const { rpc, programId, usdtMint } = cfg();
const { sellerPubkey, buyerPubkey } = req.body||{};
if(!sellerPubkey||!buyerPubkey) return res.status(400).json({ ok:false, error:'Missing fields'});
const connection = new Connection(rpc, 'confirmed');
const seller = new PublicKey(sellerPubkey); const buyer = new PublicKey(buyerPubkey);
const [escrow] = escPda(buyer, seller, programId); const [vaultAuth] = vaultAuthPda(escrow, programId);
const program = new anchor.Program(require('../idl/artcoin_escrow.json'), programId, { connection });
const { ata, ix } = await require('../_lib/onchain').ensureAtaIx(connection, seller, usdtMint);
const vaultAta = require('@solana/spl-token').getAssociatedTokenAddressSync(usdtMint, vaultAuth, true);
const pre=[]; if(ix) pre.push(ix);
const ixRel = await program.methods.release().accounts({ admin: null, escrow, usdtMint, sellerAta: ata, vaultAuth, vaultAta, tokenProgram: require('@solana/spl-token').TOKEN_PROGRAM_ID }).instruction();
const tx = await buildTx([...pre, ixRel], seller, connection);
const b64 = tx.serialize({ requireAllSignatures:false, verifySignatures:false }).toString('base64');
res.status(200).json({ ok:true, tx:b64, escrow:escrow.toBase58() });
}catch(e){res.status(500).json({ok:false,error:e.message||'Server error'})}};