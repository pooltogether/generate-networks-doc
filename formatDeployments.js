const fs = require('fs')
const path = require('path')
const find = require('find')
const chalk = require('chalk')
const glob = require('glob')

const { formatAddressUrl } = require('./formatAddressUrl')

function formatDeployments({ npmPackageName, ignoreContracts, network, githubBaseUrl }) {
  const result = []

  const hardhatNetworkName = network.hardhatNetworkName || network.name
  const projectRoot = `${__dirname}/node_modules/${npmPackageName}`
  
  const deploymentsDirectory = `${projectRoot}/deployments/${hardhatNetworkName}`
  const deploymentsDirectoryWithChainId = `${projectRoot}/deployments/${hardhatNetworkName}_${network.chainId}`
  
  let contractPaths
  if (fs.existsSync(deploymentsDirectory)) {
    contractPaths = glob.sync(`${deploymentsDirectory}/*.json`)
  } else if (fs.existsSync(deploymentsDirectoryWithChainId)) {
    contractPaths = glob.sync(`${deploymentsDirectoryWithChainId}/*.json`)
  } else {
    return result
  }

  for (let cpi = 0; cpi < contractPaths.length; cpi++) {
    const contractPath = contractPaths[cpi]

    const contract = JSON.parse(fs.readFileSync(contractPath))
    const contractName = path.basename(contractPath, ".json")

    if (!ignoreContracts.includes(contractName)) {
      
      console.log(chalk.dim(`Found contract ${contractName}...`))

      let contractLink
      let solidityFilePath

      if(fs.existsSync(`${projectRoot}/contracts`)){
        solidityFilepaths = find.fileSync(`${contractName}.sol`, `${projectRoot}/contracts`)
        
        if (solidityFilepaths.length > 0) {
          const solidityFilePath = solidityFilepaths[0].split("/contracts")[1]
          contractLink = `[${contractName}](${githubBaseUrl}/contracts${solidityFilePath})`
        } else {
          contractLink = contractName
        }

      }
      else { // case where no contracts folder in package
        contractLink = contractName
      }




      result.push(`| ${contractLink} | [${contract.address}](${formatAddressUrl(network, contract.address)}) | [Artifact](${githubBaseUrl + `/deployments/${hardhatNetworkName}/${path.basename(contractPath)}`}) |`)
    } else {
      console.log(chalk.dim(`Ignoring contract ${contractName}`))
    }
  }

  return result
}

module.exports = {
  formatDeployments
}