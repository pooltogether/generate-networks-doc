#!/usr/bin/env node

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
  },
  {
    chainId: '3',
    name: 'ropsten'
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
  append(``)
  append(`*This document was generated [automatically](https://github.com/pooltogether/generate-networks-doc)*`)
  append(``)

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


    append(`### [@pooltogether/current-pool-data](https://www.npmjs.com/package/@pooltogether/current-pool-data) ${packageJson.dependencies['@pooltogether/current-pool-data']}`)
    newContractSection()
    const { contractAddresses } = require('@pooltogether/current-pool-data')
    if (contractAddresses[chainId]) {
      const poolNames = Object.keys(contractAddresses[chainId])
      for (let npi = 0; npi < poolNames.length; npi++) {
        const poolName = poolNames[npi]
        const pool = contractAddresses[chainId][poolName]
        appendNoNewline(`| `)
        appendNoNewline(`[${poolName.toUpperCase()}](${poolTogetherContractBaseUrl + '/contracts/prize-pool/PrizePool.sol'})`)
        appendNoNewline(` ([open app](https://staging-v3.pooltogether.com))`)
        append(` | [${pool.prizePool}](${etherscanBaseUrl}/address/${pool.prizePool}) | [ABI](/.gitbook/assets/prizepoolabi.json) |`)
      }
    }
    append('')


    append(`### [@pooltogether/pooltogether-contracts](https://www.npmjs.com/package/@pooltogether/pooltogether-contracts) ${packageJson.dependencies['@pooltogether/pooltogether-contracts']}`)
    newContractSection()
    append(formatDeployments({ npmPackageName: '@pooltogether/pooltogether-contracts', ignoreContracts, networkName: name, githubBaseUrl: poolTogetherContractBaseUrl }).join('\n'))
    append('')
    

    append(`### [@pooltogether/pooltogether-rng-contracts](https://www.npmjs.com/package/@pooltogether/pooltogether-rng-contracts) ${packageJson.dependencies['@pooltogether/pooltogether-rng-contracts']}`)
    newContractSection()
    append(formatDeployments({
      npmPackageName: '@pooltogether/pooltogether-rng-contracts',
      ignoreContracts,
      networkName: name,
      githubBaseUrl: "https://github.com/pooltogether/pooltogether-rng-contracts/tree/master"
    }).join('\n'))
    append('')

    let migrateDeployments = formatDeployments({
      npmPackageName: '@pooltogether/migrate-v3',
      ignoreContracts,
      networkName: name,
      githubBaseUrl: "https://github.com/pooltogether/pooltogether-migrate-v3/tree/master"
    })

    if (migrateDeployments.length) {
      append(`### [@pooltogether/migrate-v3](https://github.com/pooltogether/pooltogether-migrate-v3) ${packageJson.dependencies['@pooltogether/migrate-v3']}`)
      newContractSection()
      append(migrateDeployments.join('\n'))
      append('')
    }

    let lootBoxDeployments = formatDeployments({
      npmPackageName: '@pooltogether/loot-box',
      ignoreContracts,
      networkName: name,
      githubBaseUrl: "https://github.com/pooltogether/loot-box/tree/main"
    })

    if (lootBoxDeployments.length) {
      append(`### [@pooltogether/loot-box](https://github.com/pooltogether/pooltogether-loot-box) ${packageJson.dependencies['@pooltogether/loot-box']}`)
      newContractSection()
      append(lootBoxDeployments.join('\n'))
      append('')
    }
    
    console.log(chalk.green(`Done ${name}!`))
    append('')
  }
  
  append('')
  
  fs.closeSync(out)  

  console.log(chalk.green(`Output to ${outputFile}`))
}

generate()
