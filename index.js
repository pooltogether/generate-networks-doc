#!/usr/bin/env node

const get = require('lodash/get')
const fs = require('fs')
const chalk = require('chalk')

const { formatDeployments } = require('./formatDeployments')

const networks = [
  {
    chainId: '1',
    name: 'mainnet'
  },
  {
    chainId: '4',
    name: 'rinkeby'
  }
]

const packageJson = require('./package.json')

const ignoreContracts = [
  'CompoundPrizePoolProxyFactory',
  'ControlledTokenProxyFactory',
  'SingleRandomWinnerProxyFactory',
  'TicketProxyFactory',
  'Link',
  'yVaultPrizePoolProxyFactory',
  'StakePrizePoolProxyFactory',
  'MultipleWinnersProxyFactory',
  'ComptrollerImplementation',
  'ProxyAdmin',
  'ProxyFactory'
]

const outputFile = `./Networks.md`


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function generate() {
  const out = fs.openSync(outputFile, 'w')
  const append = (str) => {
    fs.writeSync(out, str + "\n")
  }

  const appendNoNewline = (str) => {
    fs.writeSync(out, str)
  }

  append(`# 📡 Networks`)
  
  for (let ni = 0; ni < networks.length; ni++) {
    const network = networks[ni]
    const { chainId, name } = network

    console.log(chalk.yellow(`Generating network ${name}...`))
  
    let etherscanBaseUrl
    if (name == 'mainnet' || name == 'homestead') {
      etherscanBaseUrl = `https://etherscan.io`
    } else {
      etherscanBaseUrl = `https://${name}.etherscan.io`
    }

    append(`## ${capitalizeFirstLetter(name)}`)
    append('')

    const newContractSection = () => {
      append(`| Contract | Address | Artifact |`)
      append(`| :--- | :--- | :--- |`)
    }
    
    const poolTogetherContractBaseUrl = "https://github.com/pooltogether/pooltogether-pool-contracts/tree/version-3"


    append(`### PoolTogether Pools & Supporting Contracts`)
    append(`**@pooltogether/current-pool-data ${packageJson.dependencies['@pooltogether/current-pool-data']} [npm](https://www.npmjs.com/package/@pooltogether/current-pool-data)**`)
    append(`| Contract | Address |`)
    append(`| :--- | :--- |`)

    let currentPoolDataContracts = {
      'Dai Prize Pool': 'dai.prizePool',
      'Dai Prize Strategy': 'dai.prizeStrategy',
      'Dai POOL Faucet': 'daiFaucet',
      'UNI Prize Pool': 'uni.prizePool',
      'UNI Prize Strategy': 'uni.prizeStrategy',
      'UNI POOL Faucet': 'uniFaucet',
      'USDC Prize Pool': 'usdc.prizePool',
      'USDC Prize Strategy': 'usdc.prizeStrategy',
      'USDC POOL Faucet': 'usdcFaucet',
      'COMP Prize Pool': 'comp.prizePool',
      'COMP Prize Strategy': 'comp.prizeStrategy',
      'COMP POOL Faucet': 'compFaucet',
      'BAT Prize Pool': 'bat.prizePool',
      'BAT Prize Strategy': 'bat.prizeStrategy',
      'Loot Box ERC721': 'lootBox',
      'Loot Box Prize Strategy Listener': 'lootBoxPrizeStrategyListener'
    }

    const { contractAddresses } = require('@pooltogether/current-pool-data')
    if (contractAddresses[chainId]) {
      Object.keys(currentPoolDataContracts).forEach(contractName => {
        const address = get(contractAddresses[chainId], currentPoolDataContracts[contractName])
        if (address) {
          appendNoNewline(`| `)
          appendNoNewline(`${contractName}`)
          append(` | [${address}](${etherscanBaseUrl}/address/${address}) |`)
        }
      })
    }
    append('')

    append('### Core Contracts')
    append(`**@pooltogether/pooltogether-contracts ${packageJson.dependencies['@pooltogether/pooltogether-contracts']} [npm](https://www.npmjs.com/package/@pooltogether/pooltogether-contracts)**`)
    newContractSection()
    append(formatDeployments({ npmPackageName: '@pooltogether/pooltogether-contracts', ignoreContracts, networkName: name, githubBaseUrl: poolTogetherContractBaseUrl }).join('\n'))
    append('')

    const governanceBaseUrl = "https://github.com/pooltogether/governance/tree/main"

    append('### Governance')
    append(`**@pooltogether/governance ${packageJson.dependencies['@pooltogether/governance']} [npm](https://www.npmjs.com/package/@pooltogether/governance)**`)
    newContractSection()
    append(formatDeployments({ npmPackageName: '@pooltogether/governance', ignoreContracts, networkName: name, githubBaseUrl: governanceBaseUrl }).join('\n'))
    append('')

    append('### RNG Contracts')
    append(`**@pooltogether/pooltogether-rng-contracts ${packageJson.dependencies['@pooltogether/pooltogether-rng-contracts']} [npm](https://www.npmjs.com/package/@pooltogether/pooltogether-rng-contracts)**`)
    newContractSection()
    append(formatDeployments({
      npmPackageName: '@pooltogether/pooltogether-rng-contracts',
      ignoreContracts,
      networkName: name,
      githubBaseUrl: "https://github.com/pooltogether/pooltogether-rng-contracts/tree/master"
    }).join('\n'))
    append('')

    let lootBoxDeployments = formatDeployments({
      npmPackageName: '@pooltogether/loot-box',
      ignoreContracts,
      networkName: name,
      githubBaseUrl: "https://github.com/pooltogether/loot-box/tree/main"
    })

    if (lootBoxDeployments.length) {
      append(`### Loot Box Contracts`)
      append(`**@pooltogether/loot-box ${packageJson.dependencies['@pooltogether/loot-box']} [npm](https://www.npmjs.com/package/@pooltogether/loot-box)**`)
      newContractSection()
      append(lootBoxDeployments.join('\n'))
      append('')
    }

    const merkleBaseUrl = "https://github.com/pooltogether/merkle-distributor/tree/main"

    append(`### Retroactive Token Distribution`)
    append(`**@pooltogether/merkle-distributor ${packageJson.dependencies['@pooltogether/merkle-distributor']} [npm](https://www.npmjs.com/package/@pooltogether/merkle-distributor)**`)
    newContractSection()
    append(formatDeployments({ npmPackageName: '@pooltogether/merkle-distributor', ignoreContracts, networkName: name, githubBaseUrl: merkleBaseUrl }).join('\n'))
    append('')
    
    console.log(chalk.green(`Done ${name}!`))
    append('')
  }

  append(``)
  append(`*This document was generated [automatically](https://github.com/pooltogether/generate-networks-doc)*`)
  append(``)

  append('')
  
  fs.closeSync(out)  

  console.log(chalk.green(`Output to ${outputFile}`))
}

generate()
