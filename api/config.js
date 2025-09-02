module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    merchant: process.env.MERCHANT_ADDRESS || '6MvDDgZWAvZQH5oHcbzYo4DVk1eiNgi4NzRhc4xBg6hW',
    usdtMint: process.env.USDT_MINT || 'Es9vMFrzaCERZ8XhHk7A9G1x1VQ9v6wY5xZk1Z5hK5eR',
    network: process.env.SOLANA_NETWORK || 'mainnet'
  });
};
