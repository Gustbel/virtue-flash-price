import "./App.css";
import { useEffect, useState } from "react";
import { ethers, JsonRpcProvider, utils } from "ethers";
const vaultAbi = require("./abi/vault.json");
const tangleseaPairAbi = require("./abi/tangleseaPair.json");
const erc20Abi = require("./abi/erc20.json");

const provider = new JsonRpcProvider(
  "https://json-rpc.evm.testnet.shimmer.network"
);

// POOLS
const vaultAddress = "0x407fE48269ae4E3ce21bB650B7f642439299a4d5";

// SHIMMERSEA
const shimmerseaPoolAddresses = [
  "0x0af76ee2abe985f027292cef69f1f3a83c80b4da",
  "0x008ee1c349a657adf4b2da5210e67d0e4539ca89",
  "0xbd3b301d09f195ae9271b74c3eafe50ea8d7dda2",
];
// POOLS
const poolsPoolAddresses = [
  "0xd109f469d9cc76e6b7be41e2c701a875b14f6b44000200000000000000000005",
  "0x8ddcac03933722e257bf59680bc4bde4e9d7d68c000200000000000000000004",
  "0xc1d362c4427237ccae906433ff627fb50bf02c7c000200000000000000000006",
];

let poolUrls = [];

// Object definition
function Pool(symbol0, symbol1, cotiz0, cotiz1, balance0, balance1) {
  this.symbol0 = symbol0;
  this.symbol1 = symbol1;
  this.cotiz0 = cotiz0;
  this.cotiz1 = cotiz1;
  this.balance0 = balance0;
  this.balance1 = balance1;
}

var poolArray = [];

// Function to add a new instance of XYZ to the array
function addPool(symbol0, symbol1, cotiz0, cotiz1, balance0, balance1) {
  var newPool = new Pool(symbol0, symbol1, cotiz0, cotiz1, balance0, balance1);
  poolArray.push(newPool);
}
var emptyPool = new Pool("...", "...", "...", "...", "...", "...");

function App() {
  let emptyPoolsAmount = [];
  for (
    let i = 0;
    i < shimmerseaPoolAddresses.length + poolsPoolAddresses.length;
    i++
  ) {
    emptyPoolsAmount.push(emptyPool);
    poolUrls.push(
      `https://explorer.evm.testnet.shimmer.network/address/${shimmerseaPoolAddresses[i]}`
    );
  }

  const [pools, setPools] = useState(emptyPoolsAmount);

  useEffect(() => {
    async function setPrices() {
      // Set Pool Array to empty
      poolArray = [];

      // Get price from ShimmerSea
      const promisesShimmersea = shimmerseaPoolAddresses.map((address) => {
        return getShimmerSeaPoolData(address);
      });
      // Get Prices from Pools
      const promisesPools = poolsPoolAddresses.map((address) => {
        return getPoolsPoolData(address);
      });

      const promises = promisesShimmersea.concat(promisesPools);

      try {
        const results = await Promise.all(promises);
        console.log(results);
      } catch (error) {
        console.error(error);
      }

      setPools(poolArray);
    }
    setPrices();
  }, []);

  async function getPoolsPoolData(poolId) {
    // Instance Vault contract
    const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);

    const poolPoolsRawInfo = await vault.getPoolTokens(poolId);

    let poolPoolsBalances = [];
    let poolTokensData = [[], []];
    poolTokensData[0].push(await poolPoolsRawInfo[0][0]);
    poolTokensData[1].push(await poolPoolsRawInfo[0][1]);
    for (let i = 0; i < 2; i++) {
      const erc20 = new ethers.Contract(
        poolTokensData[i][0],
        erc20Abi,
        provider
      );
      poolTokensData[i].push(await erc20.symbol());
      poolTokensData[i].push(Number(await erc20.decimals()));

      // Save Pool Balances and cotizations
      poolPoolsBalances.push(
        Number(
          ethers.formatUnits(
            String(poolPoolsRawInfo[1][i]),
            poolTokensData[i][2]
          )
        )
      );
    }

    let poolCotizations = [];
    poolCotizations.push(poolPoolsBalances[0] / poolPoolsBalances[1]);
    poolCotizations.push(poolPoolsBalances[1] / poolPoolsBalances[0]);

    addPool(
      poolTokensData[0][1],
      poolTokensData[1][1],
      poolCotizations[0].toFixed(6),
      poolCotizations[1].toFixed(6),
      poolPoolsBalances[0].toFixed(0),
      poolPoolsBalances[1].toFixed(0)
    );
  }

  async function getShimmerSeaPoolData(poolAddress) {
    const shimmerSeaPool = new ethers.Contract(
      poolAddress,
      tangleseaPairAbi,
      provider
    );
    const poolSseaRawInfo = await shimmerSeaPool.getReserves();
    let poolSseaBalances = [];
    let poolTokensData = [[], []];
    poolTokensData[0].push(await shimmerSeaPool.token0());
    poolTokensData[1].push(await shimmerSeaPool.token1());
    for (let i = 0; i < 2; i++) {
      const erc20 = new ethers.Contract(
        poolTokensData[i][0],
        erc20Abi,
        provider
      );
      poolTokensData[i].push(await erc20.symbol());
      poolTokensData[i].push(Number(await erc20.decimals()));

      // Save Pool Balances and cotizations
      poolSseaBalances.push(
        Number(
          ethers.formatUnits(String(poolSseaRawInfo[i]), poolTokensData[i][2])
        )
      );
    }

    let poolCotizations = [];
    poolCotizations.push(poolSseaBalances[0] / poolSseaBalances[1]);
    poolCotizations.push(poolSseaBalances[1] / poolSseaBalances[0]);

    addPool(
      poolTokensData[0][1],
      poolTokensData[1][1],
      poolCotizations[0].toFixed(6),
      poolCotizations[1].toFixed(6),
      poolSseaBalances[0].toFixed(0),
      poolSseaBalances[1].toFixed(0)
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <h1>Tokens Pool Details </h1>
          <h6>
            Balances obtained from ShimmerSea Testnet - NOTE: Its not used
            `getAmountsIn` or `getAmountsOut`, we only use Pool balances here
            for the token cotization{" "}
          </h6>
        </p>
        <p>
          <img src="logoShimmersea.jpeg" width="40" height="40" />
          -- ShimmerSea PLATFORM: --
          <img src="logoShimmersea.jpeg" width="40" height="40" />{" "}
        </p>
        <p>
          <div className="table-container">
            <div class="container">
              <div class="column">
                <h4>Pool Name</h4>
              </div>
              <div class="column">
                <h4>Token 0</h4>
              </div>
              <div class="column">
                <h4>Token 1</h4>
              </div>
              <div class="column">
                <h4>Token0/Token1</h4>
              </div>
              <div class="column">
                <h4>Token1/Token0</h4>
              </div>
              <div class="column">
                <h4>Pool Balances</h4>
              </div>
            </div>
            {(() => {
              const rows = [];
              for (let i = 0; i < shimmerseaPoolAddresses.length; i++) {
                rows.push(addRow(i, pools[i]));
              }
              return rows;
            })()}
            <p>
              <img src="logoPools.png" width="40" height="40" />
              -- Pools PLATFORM: --
              <img src="logoPools.png" width="40" height="40" />{" "}
            </p>
            {(() => {
              const rows = [];
              for (
                let i = shimmerseaPoolAddresses.length;
                i < shimmerseaPoolAddresses.length + poolsPoolAddresses.length;
                i++
              ) {
                rows.push(addRow(i, pools[i]));
              }
              return rows;
            })()}
          </div>
        </p>
      </header>
    </div>
  );
}

function addRow(id, pool) {
  return (
    <div class="container">
      <div class="column">
        <h4>
          <a className="App-link" href={poolUrls[id]} target="_blank">
            Pool: {pool.symbol0 + "/" + pool.symbol1}
          </a>
        </h4>
      </div>
      <div class="column">
        <h5>{pool.symbol0}</h5>
      </div>
      <div class="column">
        <h5>{pool.symbol1}</h5>
      </div>
      <div class="column">
        <h5>{pool.cotiz0}</h5>
      </div>
      <div class="column">
        <h5>{pool.cotiz1}</h5>
      </div>
      <div class="column">
        <h5>Tok0: {pool.balance0}</h5>
        <h5>Tok1: {pool.balance1}</h5>
      </div>
    </div>
  );
}

export default App;
