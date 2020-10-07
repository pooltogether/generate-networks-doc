#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const glob = require('glob')
const find = require('find')

const networks = [
  {
    chainId: '4',
    name: 'rinkeby'
  },
  {
    chainId: '3',
    name: 'ropsten'
  }
]

const ignoreContracts = [
  'CompoundPrizePoolProxyFactory',
  'ControlledTokenProxyFactory',
  'SingleRandomWinnerProxyFactory',
  'TicketProxyFactory',
  'yVaultPrizePoolProxyFactory',
  'StakePrizePoolProxyFactory',
  'MultipleWinnersProxyFactory',
  'ComptrollerImplementation',
  'ProxyAdmin',
  'ProxyFactory'
]

const baseUrl = "https://github.com/pooltogether/pooltogether-pool-contracts/tree/version-3"
const outputFile = `./Networks.md`

const { contractAddresses } = require('@pooltogether/current-pool-data')

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
  
    append(`## ${capitalizeFirstLetter(name)}`)
    append('')

    append(`| Contract | Address | Artifact |`)
    append(`| :--- | :--- | :--- |`)

    if (contractAddresses[chainId]) {
      const poolNames = Object.keys(contractAddresses[chainId])
      for (let npi = 0; npi < poolNames.length; npi++) {
        const poolName = poolNames[npi]
        const pool = contractAddresses[chainId][poolName]
        appendNoNewline(`| `)
        appendNoNewline(`[${poolName.toUpperCase()}](${baseUrl + '/contracts/prize-pool/PrizePool.sol'})`)
        appendNoNewline(` ([open app](https://staging-v3.pooltogether.com))`)
        append(` | [${pool.prizePool}](https://${name}.etherscan.io/address/${pool.prizePool}) | [ABI](/.gitbook/assets/prizepoolabi.json) |`)
      }
    }

    const poolTogetherRoot = `${__dirname}/node_modules/@pooltogether/pooltogether-contracts/`
    const networksGlob = `${poolTogetherRoot}/deployments/${name}/*.json`
    const contractPaths = glob.sync(networksGlob)
  
    for (let cpi = 0; cpi < contractPaths.length; cpi++) {
      const contractPath = contractPaths[cpi]
  
      const contract = JSON.parse(fs.readFileSync(contractPath))
      const contractName = path.basename(contractPath, ".json")
  
      if (!ignoreContracts.includes(contractName)) {
        console.log(chalk.dim(`Found contract ${contractName}...`))
  
        const solidityFilepaths = find.fileSync(`${contractName}.sol`, `${poolTogetherRoot}/contracts`)
        let contractLink
        if (solidityFilepaths.length > 0) {
          const solidityFilePath = solidityFilepaths[0].split("/contracts")[1]
          contractLink = `[${contractName}](${baseUrl}/contracts${solidityFilePath})`
        } else {
          contractLink = contractName
        }
  
        append(`| ${contractLink} | [${contract.address}](https://${network}.etherscan.io/address/${contract.address}) | [Artifact](${baseUrl + `/deployments/${network}/${path.basename(contractPath)}`}) |`)
      } else {
        console.log(chalk.dim(`Ignoring contract ${contractName}`))
      }
    }
  
    console.log(chalk.green(`Done ${network}!`))
    append('')
  }
  
  append('')
  
  fs.closeSync(out)  

  console.log(chalk.green(`Output to ${outputFile}`))
}

generate()
