import "./App.css";
import { useEffect, useState } from "react";
import { ethers, JsonRpcProvider, utils } from "ethers";
const vaultAbi = require("./abi/vault.json");
const tangleseaPairAbi = require("./abi/tangleseaPair.json");
const erc20Abi = require("./abi/erc20.json");

const wsmrPrice = 0.05;
const usdtPrice = 1.02;

// POOLS
//const vaultAddress = "0x8021c957a0FF43ee4aF585D10a14bD14C30b89F7"
//const pool1Id = "0x4bfd8353eddf067588d3a48389fcdbe3777f9ba4000200000000000000000008"
//const pool2Id = '0xc800de05df867e81fcb3fddd16baf0ce4db64b70000000000000000000000009'

// SHIMMERSEA
const shimmerseaPoolAddresses = [
  "0x0af76ee2abe985f027292cef69f1f3a83c80b4da",
  "0x008ee1c349a657adf4b2da5210e67d0e4539ca89",
  "0xbd3b301d09f195ae9271b74c3eafe50ea8d7dda2",
  "0x9c7Bf87CEC82Ce93475c6a51593101402A3054e0",
  "0x65a8c0a10b265843487dfde2925e11e467eed727",
];

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
  for (let i = 0; i < shimmerseaPoolAddresses.length; i++) {
    emptyPoolsAmount.push(emptyPool);
  }

  const [pools, setPools] = useState(emptyPoolsAmount);

  useEffect(() => {
    async function setPrices() {
      const provider = new JsonRpcProvider(
        "https://json-rpc.evm.testnet.shimmer.network"
      );

      // Set Pool Array to empty
      poolArray = [];
      /*
      // Get price from Pools
      const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
      // Pool1
      const pool1PoolsRawInfo = await vault.getPoolTokens(pool1Id);
      const pool1PoolsWsmrBalance = Number(ethers.formatUnits(String(pool1PoolsRawInfo[1][0]), 18))
      const pool1PoolsVusdBalance = Number(ethers.formatUnits(String(pool1PoolsRawInfo[1][1]), 18))
      let poolCotization = pool1PoolsWsmrBalance/pool1PoolsVusdBalance
      const pool1PoolsVusdPrice = poolCotization * wsmrPrice
      const pool1PoolsCap = pool1PoolsWsmrBalance * wsmrPrice + pool1PoolsVusdBalance * pool1PoolsVusdPrice
      // Pool2
      const pool2PoolsRawInfo = await vault.getPoolTokens(pool2Id);
      const pool2PoolsUsdtBalance = Number(ethers.formatUnits(String(pool2PoolsRawInfo[1][0]), 6))
      const pool2PoolsVusdBalance = Number(ethers.formatUnits(String(pool2PoolsRawInfo[1][1]), 18))
      poolCotization = pool2PoolsUsdtBalance/pool2PoolsVusdBalance
      const pool2PoolsVusdPrice = poolCotization * usdtPrice
      const pool2PoolsCap = pool2PoolsUsdtBalance * usdtPrice + pool2PoolsVusdBalance * pool2PoolsVusdPrice
*/

      // Get price from ShimmerSea
      // Pool1

      for (let i = 0; i < shimmerseaPoolAddresses.length; i++) {
        const shimmerSeaPool = new ethers.Contract(
          shimmerseaPoolAddresses[i],
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
              ethers.formatUnits(
                String(poolSseaRawInfo[i]),
                poolTokensData[i][2]
              )
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

      setPools(poolArray);
    }
    setPrices();
  }, []);

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
              rows.push(addRow(pools[i]));
            }
            return rows;
          })()}
        </p>
      </header>
    </div>
  );
}

function addRow(pool) {
  return (
    <div class="container">
      <div class="column">
        <h4>Pool: {pool.symbol0 + "/" + pool.symbol1}</h4>
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
        <h5>Tok1: {pool.balance0}</h5>
        <h5>Tok2: {pool.balance1}</h5>
      </div>
    </div>
  );
}

export default App;
