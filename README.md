# Generate Networks documentation

This project updates the network pages in the official [PoolTogether documentation](https://docs.pooltogether.com).  This project will gather all deployed contract addresses and format markdown pages for each network.

# Adding a New Package

Packages must use [hardhat](https://hardhat.org) and be deployed using the `hardhat-deploy` plugin.

First add the package as a dependency to `package.json`.  For example:

```json
"dependencies": {
  "@pooltogether/governance": "^1.0.1"
}
```

Secondly update the `index.js` to include the package.  Addd a new `appendPackage` call in the appropriate location.  For example:

```javascript
appendPackage({
  name: 'Governance',
  npmPackageName: '@pooltogether/governance',
  githubBaseUrl: 'https://github.com/pooltogether/governance/tree/main'
})
```

# Adding a New Network

The documentation is managed through Gitbook, so you must first create the page for the network in Gitbook.

Once the page is added in Gitbook, you can add the new network entry in `index.js`.  Update the `generate()` function to include the new network.  For example:

```javascript
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
await generateBlockchainNetworks(maticNetworks, `./networks/matic.md`)
```

Note that the `matic.md` will be the generated Markdown file.  This filename must match the page that was created in Gitbook.

# Setup

```sh
$ yarn
```

# Usage

To generate the pages:

```sh
$ yarn generate
```

To generate the pages and push changes to Gitbook (https://docs.pooltogether.com):

```sh
$ yarn generate-and-push
```

Note: you must have write access to the repo.

To update the Pools, artifacts and addresses just update the dependencies in `package.json`:

```json
{
  // ...
  "dependencies": {
      "@pooltogether/current-pool-data": "^3.0.0-alpha.40",
      "@pooltogether/pooltogether-contracts": "^3.0.0-alpha.41",
  }
}
```
