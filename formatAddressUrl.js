function formatAddressUrl(network, address) {
  const { chainId, name } = network

  let url
  if (chainId == 1) {
    url = `https://etherscan.io/address/${address}`
  } else if (chainId == 77) {
    url = `https://blockscout.com/poa/sokol/address/${address}`
  } else if (chainId == 100) {
    url = `https://blockscout.com/xdai/mainnet/address/${address}`
  } else if (chainId == 137) {
    url = `https://explorer-mainnet.maticvigil.com/address/${address}`
  } else if (chainId == 80001) {
    url = `https://explorer-mumbai.maticvigil.com/address/${address}`
  } else {
    url = `https://${name}.etherscan.io/address/${address}`
  }

  return url
}

module.exports = {
  formatAddressUrl
}