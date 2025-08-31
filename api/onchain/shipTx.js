const { cfg, escPda, vaultAuthPda, as32, buildTx, ensureAtaIx, idl, SystemProgram, PublicKey, Connection, anchor } = require('../_lib/onchain');
module.exports=async(req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');if((req.method||'').toUpperCase()==='OPTIONS')return res.status(200).end();if((req.method||'').toUpperCase()!=='POST')return res.status(405).json({ok:false,error:'Method Not Allowed'});try{
const { rpc, programId } = cfg();
const { sellerPubkey, buyerPubkey, trackingHashHex } = req.body||{};
if(!sellerPubkey||!buyerPubkey||!trackingHashHex) return res.status(400).json({ ok:false, error:'Missing fields'});
const connection = new Connection(rpc, 'confirmed');
const seller = new PublicKey(sellerPubkey); const buyer = new PublicKey(buyerPubkey);
const [escrow] = escPda(buyer, seller, programId);
const program = new anchor.Program(require('../idl/artcoin_escrow.json'), programId, { connection });
const tracking = require('../_lib/onchain').as32(trackingHashHex);
const ix = await program.methods.setTrackingAndShip(tracking).accounts({ seller, escrow }).instruction();
const tx = await buildTx([ix], seller, connection);
const b64 = tx.serialize({ requireAllSignatures:false, verifySignatures:false }).toString('base64');
res.status(200).json({ ok:true, tx:b64, escrow:escrow.toBase58() });
}catch(e){res.status(500).json({ok:false,error:e.message||'Server error'})}};