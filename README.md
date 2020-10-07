# Generate Networks documentation

This project generates a Markdown formatted page including all of the network information for PoolTogether.

# Usage

To generate markdown file `Networks.md` call:

```sh
$ yarn generate
```

To generate the markdown file and push changes to Gitbook (https://docs.pooltogether.com):

```sh
$ yarn generate-and-push
```

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

# Setup

```sh
$ yarn
```
