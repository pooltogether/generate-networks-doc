#!/usr/bin/env node

const get = require("lodash/get");
const fs = require("fs");
const fsPromises = require("fs").promises;
const chalk = require("chalk");

const { formatDeployments } = require("./formatDeployments");
const { formatAddressUrl } = require("./formatAddressUrl");

const packageJson = require("./package.json");

const ignoreContracts = [
  "CompoundPrizePoolProxyFactory",
  "ControlledTokenProxyFactory",
  "SingleRandomWinnerProxyFactory",
  "TicketProxyFactory",
  "Link",
  "yVaultPrizePoolProxyFactory",
  "StakePrizePoolProxyFactory",
  "MultipleWinnersProxyFactory",
  "ComptrollerImplementation",
  "ProxyAdmin",
  "ProxyFactory",
];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const append = (out, str) => {
  fs.writeSync(out, str + "\n");
};

const appendNoNewline = (out, str) => {
  fs.writeSync(out, str);
};

async function generateBlockchainNetworks(networks, networkFilePath) {
  const networkFile = fs.openSync(networkFilePath, "w");

  for (let ni = 0; ni < networks.length; ni++) {
    const network = networks[ni];

    const { chainId, name } = network;

    console.log(chalk.yellow(`Generating network ${name}...`));

    append(networkFile, `# ${capitalizeFirstLetter(name)}`);
    append(networkFile, "");

    const newContractSection = () => {
      append(networkFile, `| Contract | Address | Artifact |`);
      append(networkFile, `| :--- | :--- | :--- |`);
    };

    let contractAddressSelection = [
      { name: "Dai Prize Pool", addressPath: "dai.prizePool" },
      { name: "Dai Prize Strategy", addressPath: "dai.prizeStrategy" },
      { name: "Dai POOL Faucet", addressPath: "daiFaucet" },
      { name: "Dai Pod", addressPath: "dai.pod" },
      { name: "USDC Prize Pool", addressPath: "usdc.prizePool" },
      { name: "USDC Prize Strategy", addressPath: "usdc.prizeStrategy" },
      { name: "USDC POOL Faucet", addressPath: "usdcFaucet" },
      { name: "USDC Pod", addressPath: "usdc.pod" },
      { name: "UNI Prize Pool", addressPath: "uni.prizePool" },
      { name: "UNI Prize Strategy", addressPath: "uni.prizeStrategy" },
      { name: "UNI POOL Faucet", addressPath: "uniFaucet" },
      { name: "COMP Prize Pool", addressPath: "comp.prizePool" },
      { name: "COMP Prize Strategy", addressPath: "comp.prizeStrategy" },
      { name: "COMP POOL Faucet", addressPath: "compFaucet" },
      { name: "GUSD Prize Pool", addressPath: "gusd.prizePool" },
      { name: "GUSD Prize Strategy", addressPath: "gusd.prizeStrategy" },
      { name: "BAT Prize Pool", addressPath: "bat.prizePool" },
      { name: "BAT Prize Strategy", addressPath: "bat.prizeStrategy" },
      { name: "POOL Prize Pool", addressPath: "pool.prizePool" },
      { name: "POOL Prize Strategy", addressPath: "pool.prizeStrategy" },
      { name: "POOL POOL Faucet", addressPath: "poolPoolFaucet" },
      { name: "Loot Box ERC721", addressPath: "lootBox" },
      {
        name: "Loot Box Prize Strategy Listener",
        addressPath: "lootBoxPrizeStrategyListener",
      },
      { name: "Aave USDT Prize Pool", addressPath: "aaveUsdt.prizePool" },
      {
        name: "Aave USDT Prize Strategy",
        addressPath: "aaveUsdt.prizeStrategy",
      },
      { name: "Sushi Prize Pool", addressPath: "sushi.prizePool" },
      {
        name: "Sushi Prize Strategy",
        addressPath: "sushi.prizeStrategy",
      },
      {
        name: "Sushi Faucet",
        addressPath: "sushiFaucet",
      },
      { name: "USDT Prize Pool", addressPath: "usdt.prizePool" },
      { name: "USDT Prize Strategy", addressPath: "usdt.prizeStrategy" },
      { name: "USDT Token Faucet", addressPath: "usdt.tokenFaucet" },
      {
        name: "Uniswap POOL LP Prize Pool",
        addressPath: "uniswapPoolEth.prizePool",
      },
      { name: "Uniswap POOL LP Faucet", addressPath: "uniswapPoolEthFaucet" },
      { name: "Reserve Registry", addressPath: "reserveRegistry" },
      { name: "Pod Factory", addressPath: "podFactory" },
    ];

    const {
      contractAddresses,
      prizePoolContracts
    } = require("@pooltogether/current-pool-data");
    if (contractAddresses[chainId]) {
      append(networkFile, `## PoolTogether Pools & Supporting Contracts`);
      append(
        networkFile,
        `**@pooltogether/current-pool-data ${packageJson.dependencies["@pooltogether/current-pool-data"]} [npm](https://www.npmjs.com/package/@pooltogether/current-pool-data)**`
      );
      append(networkFile, `| Contract | Address |`);
      append(networkFile, `| :--- | :--- |`);

      contractAddressSelection.forEach((contract) => {
        const address = get(contractAddresses[chainId], contract.addressPath);
        if (address) {
          appendNoNewline(networkFile, `| `);
          appendNoNewline(networkFile, `${contract.name}`);
          append(
            networkFile,
            ` | [${address}](${formatAddressUrl(network, address)}) |`
          );
        }
      });
    }
    append(networkFile, "");

    function appendPackage({ name, npmPackageName, githubBaseUrl }) {
      const deployments = formatDeployments({
        npmPackageName,
        ignoreContracts,
        network,
        githubBaseUrl,
      });
      if (deployments.length) {
        append(networkFile, `## ${name}`);
        append(
          networkFile,
          `**${npmPackageName} ${packageJson.dependencies[npmPackageName]} [npm](https://www.npmjs.com/package/${npmPackageName})**`
        );
        newContractSection();
        append(networkFile, deployments.join("\n"));
        append(networkFile, "");
      }
    }

    appendPackage({
      name: "Configurable Reserve",
      npmPackageName: "@pooltogether/configurable-reserve-contracts",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-reserve-contracts/tree/master",
    });

    appendPackage({
      name: "Builders",
      npmPackageName: "@pooltogether/pooltogether-contracts",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-pool-contracts/tree/master",
    });

    appendPackage({
      name: "Governance",
      npmPackageName: "@pooltogether/governance",
      githubBaseUrl: "https://github.com/pooltogether/governance/tree/main",
    });

    appendPackage({
      name: "RNG Contracts",
      npmPackageName: "@pooltogether/pooltogether-rng-contracts",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-rng-contracts/tree/master",
    });

    appendPackage({
      name: "Loot Box Contracts",
      npmPackageName: "@pooltogether/loot-box",
      githubBaseUrl: "https://github.com/pooltogether/loot-box/tree/main",
    });

    appendPackage({
      name: "Retroactive Token Distribution",
      npmPackageName: "@pooltogether/merkle-distributor",
      githubBaseUrl:
        "https://github.com/pooltogether/merkle-distributor/tree/main",
    });

    appendPackage({
      name: "Generic Proxy Factory",
      npmPackageName: "@pooltogether/pooltogether-proxy-factory",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-proxy-factory/tree/main",
    });

    appendPackage({
      name: "Generic Address Registry",
      npmPackageName: "@pooltogether/pooltogether-generic-registry",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-generic-registry/tree/main",
    });

    appendPackage({
      name: "Prize Pool Registry",
      npmPackageName: "@pooltogether/pooltogether-prizepool-registry",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-prizepool-registry/tree/main",
    });

    appendPackage({
      name: "Pods Registry",
      npmPackageName: "@pooltogether/pooltogether-pods-registry",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-prizepool-registry/tree/main",
    });

    appendPackage({
      name: "Prize Strategy Upkeep",
      npmPackageName: "@pooltogether/pooltogether-prizestrategy-upkeep",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-prizestrategy-upkeep/tree/main",
    });

    appendPackage({
      name: "Pods Upkeep",
      npmPackageName: "@pooltogether/pooltogether-pods-upkeep",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-pods-upkeep/tree/master",
    });

    appendPackage({
      name: "Aave Yield Source",
      npmPackageName: "@pooltogether/aave-yield-source",
      githubBaseUrl:
        "https://github.com/pooltogether/aave-yield-source/tree/main",
    });

    appendPackage({
      name: "Sushi Yield Source",
      npmPackageName: "@pooltogether/pooltogether-sushi-yield-source",
      githubBaseUrl:
        "https://github.com/pooltogether/sushi-pooltogether/tree/master",
    });

    appendPackage({
      name: "EVM Bridge",
      npmPackageName: "@pooltogether/pooltogether-evm-bridge",
      githubBaseUrl:
        "https://github.com/pooltogether/pooltogether-evm-bridge/tree/master",
    });

    appendPackage({
      name: "Multi Token Listener",
      npmPackageName: "@pooltogether/multi-token-listener",
      githubBaseUrl:
        "https://github.com/pooltogether/multi-token-listener/tree/master",
    });

    console.log(chalk.green(`Done ${name}!`));
    append(networkFile, "");
  }

  fs.closeSync(networkFile);
}

async function generate() {
  console.log(chalk.dim(`Generating network files...`));

  // The output directory of all files
  const outputDir = "./networks";
  await fsPromises.mkdir(outputDir, { recursive: true });

  const ethereumNetworks = [
    {
      chainId: "1",
      name: "mainnet",
    },
    {
      chainId: "4",
      name: "rinkeby",
    },
    {
      chainId: "42",
      name: "kovan",
    },
  ];

  const xDaiNetworks = [
    {
      chainId: "100",
      name: "xDai",
      hardhatNetworkName: "xdai",
    },
    {
      chainId: "77",
      name: "sokol",
      hardhatNetworkName: "poaSokol",
    },
  ];

  const maticNetworks = [
    {
      chainId: 137,
      name: "matic",
    },
    {
      chainId: 80001,
      name: "mumbai",
    },
  ];

  const binanceNetworks = [
    {
      chainId: 56,
      name: "BSC",
      hardhatNetworkName: "bsc",
    },
    {
      chainId: 97,
      name: "BSC Testnet",
      hardhatNetworkName: "bscTestnet",
    },
  ];

  const celoNetworks = [
    {
      chainId: 42220,
      name: "Celo",
      hardhatNetworkName: 'celo'
    },
    {
      chainId: 44787,
      name: 'Alfajores',
      hardhatNetworkName: 'celoTestnet'
    }
  ]

  await generateBlockchainNetworks(ethereumNetworks, `./networks/ethereum.md`);
  await generateBlockchainNetworks(xDaiNetworks, `./networks/xdai.md`);
  await generateBlockchainNetworks(maticNetworks, `./networks/matic.md`);
  await generateBlockchainNetworks(binanceNetworks, `./networks/binance.md`);
  await generateBlockchainNetworks(celoNetworks, './networks/celo.md');

  console.log(chalk.green(`Done!`));
}

generate();
