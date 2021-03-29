# Generate Networks documentation

This project updates the network pages in the official [PoolTogether documentation](https://docs.pooltogether.com).  This project will gather all deployed contract addresses and format markdown pages for each network.

Note: the pages must have been created through Gitbook, otherwise they won't show up.  Pages for new networks should first be added to Gitbook, then they can be generated here.

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
