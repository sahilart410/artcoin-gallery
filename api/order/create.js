module.exports=async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  if((req.method||'').toUpperCase()==='OPTIONS')return res.status(200).end();
  res.status(200).json({ok:true});
};