#!/usr/bin/env node

const get = require('lodash/get')
const fs = require('fs')
const fsPromises = require('fs').promises
const chalk = require('chalk')

const { formatDeployments } = require('./formatDeployments')
const { formatAddressUrl } = require('./formatAddressUrl')

const ethereumNetworks = [
  {
    chainId: '1',
    name: 'mainnet'
  },
  {
    chainId: '4',
    name: 'rinkeby'
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
      'Loot Box ERC721': 'lootBox',
      'Loot Box Prize Strategy Listener': 'lootBoxPrizeStrategyListener',
      'Reserve': 'reserve',
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

    const poolTogetherContractBaseUrl = "https://github.com/pooltogether/pooltogether-pool-contracts/tree/master"
    append(networkFile, '## Builders')
    append(networkFile, `**@pooltogether/pooltogether-contracts ${packageJson.dependencies['@pooltogether/pooltogether-contracts']} [npm](https://www.npmjs.com/package/@pooltogether/pooltogether-contracts)**`)
    newContractSection()
    append(networkFile, formatDeployments({ npmPackageName: '@pooltogether/pooltogether-contracts', ignoreContracts, network, githubBaseUrl: poolTogetherContractBaseUrl }).join('\n'))
    append(networkFile, '')

    const governanceBaseUrl = "https://github.com/pooltogether/governance/tree/main"

    const governanceDeployments = formatDeployments({ npmPackageName: '@pooltogether/governance', ignoreContracts, network, githubBaseUrl: governanceBaseUrl })
    if (governanceDeployments.length) {
      append(networkFile, '## Governance')
      append(networkFile, `**@pooltogether/governance ${packageJson.dependencies['@pooltogether/governance']} [npm](https://www.npmjs.com/package/@pooltogether/governance)**`)
      newContractSection()
      append(networkFile, governanceDeployments.join('\n'))
      append(networkFile, '')
    }

    append(networkFile, '## RNG Contracts')
    append(networkFile, `**@pooltogether/pooltogether-rng-contracts ${packageJson.dependencies['@pooltogether/pooltogether-rng-contracts']} [npm](https://www.npmjs.com/package/@pooltogether/pooltogether-rng-contracts)**`)
    newContractSection()
    append(networkFile, formatDeployments({
      npmPackageName: '@pooltogether/pooltogether-rng-contracts',
      ignoreContracts,
      network,
      githubBaseUrl: "https://github.com/pooltogether/pooltogether-rng-contracts/tree/master"
    }).join('\n'))
    append(networkFile, '')

    let lootBoxDeployments = formatDeployments({
      npmPackageName: '@pooltogether/loot-box',
      ignoreContracts,
      network,
      githubBaseUrl: "https://github.com/pooltogether/loot-box/tree/main"
    })

    if (lootBoxDeployments.length) {
      append(networkFile, `## Loot Box Contracts`)
      append(networkFile, `**@pooltogether/loot-box ${packageJson.dependencies['@pooltogether/loot-box']} [npm](https://www.npmjs.com/package/@pooltogether/loot-box)**`)
      newContractSection()
      append(networkFile, lootBoxDeployments.join('\n'))
      append(networkFile, '')
    }

    const merkleBaseUrl = "https://github.com/pooltogether/merkle-distributor/tree/main"

    const merkleDeployments = formatDeployments({ npmPackageName: '@pooltogether/merkle-distributor', ignoreContracts, network, githubBaseUrl: merkleBaseUrl })

    if (merkleDeployments.length) {
      append(networkFile, `## Retroactive Token Distribution`)
      append(networkFile, `**@pooltogether/merkle-distributor ${packageJson.dependencies['@pooltogether/merkle-distributor']} [npm](https://www.npmjs.com/package/@pooltogether/merkle-distributor)**`)
      newContractSection()
      append(networkFile, merkleDeployments.join('\n'))
      append(networkFile, '')
    }
    
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

  await generateBlockchainNetworks(ethereumNetworks, `./networks/ethereum.md`)
  await generateBlockchainNetworks(xDaiNetworks, `./networks/xdai.md`)
  await generateBlockchainNetworks(maticNetworks, `./networks/matic.md`)

  console.log(chalk.green(`Done!`))
}

generate()
