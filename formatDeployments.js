const fs = require('fs')
const path = require('path')
const find = require('find')
const chalk = require('chalk')
const glob = require('glob')

function formatDeployments({ npmPackageName, ignoreContracts, networkName, githubBaseUrl }) {
  const result = []

  const projectRoot = `${__dirname}/node_modules/${npmPackageName}/`
  const deploymentsGlob = `${projectRoot}/deployments/${networkName}/*.json`
  const contractPaths = glob.sync(deploymentsGlob)

  for (let cpi = 0; cpi < contractPaths.length; cpi++) {
    const contractPath = contractPaths[cpi]

    const contract = JSON.parse(fs.readFileSync(contractPath))
    const contractName = path.basename(contractPath, ".json")

    if (!ignoreContracts.includes(contractName)) {
      console.log(chalk.dim(`Found contract ${contractName}...`))

      const solidityFilepaths = find.fileSync(`${contractName}.sol`, `${projectRoot}/contracts`)
      let contractLink
      if (solidityFilepaths.length > 0) {
        const solidityFilePath = solidityFilepaths[0].split("/contracts")[1]
        contractLink = `[${contractName}](${githubBaseUrl}/contracts${solidityFilePath})`
      } else {
        contractLink = contractName
      }

      result.push(`| ${contractLink} | [${contract.address}](https://${networkName}.etherscan.io/address/${contract.address}) | [Artifact](${githubBaseUrl + `/deployments/${networkName}/${path.basename(contractPath)}`}) |`)
    } else {
      console.log(chalk.dim(`Ignoring contract ${contractName}`))
    }
  }

  return result
}

module.exports = {
  formatDeployments
}