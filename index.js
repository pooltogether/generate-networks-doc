#!/usr/bin/env node

const get = require('lodash/get')
const fs = require('fs')
const fsPromises = require('fs').promises
const chalk = require('chalk')

const { formatDeployments } = require('./formatDeployments')
const { formatAddressUrl } = require('./formatAddressUrl')

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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const append = (out, str) => {
  fs.writeSync(out, str + "\n")
}

const appendNoNewline = (out, str) => {
  fs.writeSync(out, str)
}

async function generateBlockchainNetworks(networks, networkFilePath) {
  const networkFile = fs.openSync(networkFilePath, 'w')

  for (let ni = 0; ni < networks.length; ni++) {
    const network = networks[ni]

    const { chainId, name } = network

    console.log(chalk.yellow(`Generating network ${name}...`))

    append(networkFile, `# ${capitalizeFirstLetter(name)}`)
    append(networkFile, '')

    const newContractSection = () => {
      append(networkFile, `| Contract | Address | Artifact |`)
      append(networkFile, `| :--- | :--- | :--- |`)
    }
    
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
      'POOL Prize Pool': 'pool.prizePool',
      'POOL Prize Strategy': 'pool.prizeStrategy',
      'POOL POOL Faucet': 'poolPoolFaucet',
      'Loot Box ERC721': 'lootBox',
      'Loot Box Prize Strategy Listener': 'lootBoxPrizeStrategyListener',
      'Reserve Registry': 'reserveRegistry'
    }

    const { contractAddresses } = require('@pooltogether/current-pool-data')
    if (contractAddresses[chainId]) {
      append(networkFile, `## PoolTogether Pools & Supporting Contracts`)
      append(networkFile, `**@pooltogether/current-pool-data ${packageJson.dependencies['@pooltogether/current-pool-data']} [npm](https://www.npmjs.com/package/@pooltogether/current-pool-data)**`)
      append(networkFile, `| Contract | Address |`)
      append(networkFile, `| :--- | :--- |`)

      Object.keys(currentPoolDataContracts).forEach(contractName => {
        const address = get(contractAddresses[chainId], currentPoolDataContracts[contractName])
        if (address) {
          appendNoNewline(networkFile, `| `)
          appendNoNewline(networkFile, `${contractName}`)
          append(networkFile, ` | [${address}](${formatAddressUrl(network, address)}) |`)
        }
      })
    }
    append(networkFile, '')

    function appendPackage({ name, npmPackageName, githubBaseUrl }) {
      const deployments = formatDeployments({ npmPackageName, ignoreContracts, network, githubBaseUrl })
      if (deployments.length) {
        append(networkFile, `## ${name}`)
        append(networkFile, `**${npmPackageName} ${packageJson.dependencies[npmPackageName]} [npm](https://www.npmjs.com/package/${npmPackageName})**`)
        newContractSection()
        append(networkFile, deployments.join('\n'))
        append(networkFile, '')
      }
    }

    appendPackage({
      name: 'Builders',
      npmPackageName: '@pooltogether/pooltogether-contracts',
      githubBaseUrl: 'https://github.com/pooltogether/pooltogether-pool-contracts/tree/master'
    })

    appendPackage({
      name: 'Governance',
      npmPackageName: '@pooltogether/governance',
      githubBaseUrl: 'https://github.com/pooltogether/governance/tree/main'
    })

    appendPackage({
      name: 'RNG Contracts',
      npmPackageName: '@pooltogether/pooltogether-rng-contracts',
      githubBaseUrl: 'https://github.com/pooltogether/pooltogether-rng-contracts/tree/master'
    })

    appendPackage({
      name: 'Loot Box Contracts',
      npmPackageName: '@pooltogether/loot-box',
      githubBaseUrl: 'https://github.com/pooltogether/loot-box/tree/main'
    })

    appendPackage({
      name: 'Retroactive Token Distribution',
      npmPackageName: '@pooltogether/merkle-distributor',
      githubBaseUrl: 'https://github.com/pooltogether/merkle-distributor/tree/main'
    })
    
    appendPackage({
      name: 'Generic Proxy Factory',
      npmPackageName: '@pooltogether/pooltogether-proxy-factory',
      githubBaseUrl: 'https://github.com/pooltogether/pooltogether-proxy-factory/tree/main'
    })

    appendPackage({
      name: 'Aave Yield Source',
      npmPackageName: '@pooltogether/aave-yield-source',
      githubBaseUrl: 'https://github.com/pooltogether/aave-yield-source/tree/main'
    })


    console.log(chalk.green(`Done ${name}!`))
    append(networkFile, '')
  }

  fs.closeSync(networkFile)
}

async function generate() {
  console.log(chalk.dim(`Generating network files...`))

  // The output directory of all files
  const outputDir = './networks'
  await fsPromises.mkdir(outputDir, { recursive: true })

  const ethereumNetworks = [
    {
      chainId: '1',
      name: 'mainnet'
    },
    {
      chainId: '4',
      name: 'rinkeby'
    },
    {
      chainId: '42',
      name: 'kovan'
    }
  ]

  const xDaiNetworks = [
    {
      chainId: '100',
      name: 'xDai',
      hardhatNetworkName: 'xdai'
    },
    {
      chainId: '77',
      name: 'sokol',
      hardhatNetworkName: 'poaSokol'
    }
  ]

  const maticNetworks = [
    {
      chainId: 137,
      name: 'matic'
    },
    {
      chainId: 80001,
      name: 'mumbai'
    }
  ]

  const binanceNetworks = [
    {
      chainId: 56,
      name: 'BSC',
      hardhatNetworkName: 'bsc'
    },
    {
      chainId: 97,
      name: 'BSC Testnet',
      hardhatNetworkName: 'bscTestnet'
    }
  ]

  await generateBlockchainNetworks(ethereumNetworks, `./networks/ethereum.md`)
  await generateBlockchainNetworks(xDaiNetworks, `./networks/xdai.md`)
  await generateBlockchainNetworks(maticNetworks, `./networks/matic.md`)
  await generateBlockchainNetworks(binanceNetworks, `./networks/binance.md`)

  console.log(chalk.green(`Done!`))
}

generate()
