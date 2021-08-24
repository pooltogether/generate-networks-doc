function formatAddressUrl(network, address) {
  const { chainId, name } = network

  let url
  if (chainId == 1) {
    url = `https://etherscan.io/address/${address}`
  } else if (chainId == 56) {
    url = `https://bscscan.com/address/${address}`
  } else if (chainId == 77) {
    url = `https://blockscout.com/poa/sokol/address/${address}`
  } else if (chainId == 97) {
    url = `https://testnet.bscscan.com/address/${address}`
  } else if (chainId == 100) {
    url = `https://blockscout.com/xdai/mainnet/address/${address}`
  } else if (chainId == 137) {
    url = `https://explorer-mainnet.maticvigil.com/address/${address}`
  } else if (chainId == 80001) {
    url = `https://explorer-mumbai.maticvigil.com/address/${address}`
  } else if (chainId == 42220) {
    url = `https://explorer.celo.org/address/${address}`
  } else if (chainId == 44787) {
    url = `https://alfajores-blockscout.celo-testnet.org/address/${address}`
  } else {
    url = `https://${name}.etherscan.io/address/${address}`
  }
  return url
}

module.exports = {
  formatAddressUrl
}
