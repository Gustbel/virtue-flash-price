import './App.css';
import {useEffect, useState} from 'react';
import { ethers, JsonRpcProvider, utils } from 'ethers';
const vaultAbi = require('./abi/vault.json');
const tangleseaPairAbi = require('./abi/tangleseaPair.json');


const wsmrPrice = 0.05
// POOLS
const vaultAddress = "0x8021c957a0FF43ee4aF585D10a14bD14C30b89F7"
const poolId = "0xd04978fce521e644ebddaa1aabcad6d36b518d34000200000000000000000005"

// SHIMMERSEA
const shimmerSeaPoolAddress = "0x4e924F6a6AC5452D6E1cB08818Fb103Fd0328eb0"

// Object definition
function Pool(price, wsmrBalance, vusddBalance, capitalization, dominance) {
  this.price = price;
  this.wsmrBalance = wsmrBalance;
  this.vusddBalance = vusddBalance;
  this.capitalization = capitalization;
  this.dominance = dominance;
}

var poolArray = [];

// Function to add a new instance of XYZ to the array
function addPool(price, wsmrBalance, vusddBalance, capitalization, dominance) {
  var newPool = new Pool(price, wsmrBalance, vusddBalance, capitalization, dominance);
  poolArray.push(newPool);
}


function App() {
  const [pools, setPools] = useState([]);

  useEffect(() => {
    async function setPrices() {
      const provider = new JsonRpcProvider('https://json-rpc.evm.testnet.shimmer.network');

      // Set Pool Array to empty
      poolArray = [];

      // Get price from Pools
      const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
      let poolRawInfo = await vault.getPoolTokens(poolId);
      const poolsWsmrBalance = Number(ethers.formatUnits(String(poolRawInfo[1][0]), 18))
      const poolsVusddBalance = Number(ethers.formatUnits(String(poolRawInfo[1][1]), 18))
      let poolCotization = poolsWsmrBalance/poolsVusddBalance
      const poolsPrice = (poolCotization * wsmrPrice).toFixed(5)


      // Get price from ShimmerSea
      const shimmerSeaPool = new ethers.Contract(shimmerSeaPoolAddress, tangleseaPairAbi, provider);
      poolRawInfo = await shimmerSeaPool.getReserves()
      const sseaWsmrBalance = Number(ethers.formatUnits(String(poolRawInfo[0]), 18))
      const sseaVusddBalance = Number(ethers.formatUnits(String(poolRawInfo[1]), 18))
      poolCotization = sseaWsmrBalance/sseaVusddBalance
      const sseaPrice = (poolCotization * wsmrPrice).toFixed(5)
      
      addPool(poolsPrice, poolsWsmrBalance, poolsVusddBalance, 300, 10)
      addPool(sseaPrice, sseaWsmrBalance, sseaVusddBalance, 400, 20)
      setPools(poolArray)
    }
    setPrices();
  }, []);



  return (
    <div className="App">
      <header className="App-header">
        <p>
          <h1>
            vUSD PRICE IN USD
          </h1>
          <h6>
            Note: The reference with USD DOLLAR is made with the HARCODED Price of WSMR = 0.05 USD
          </h6>
        </p>

        <p>
            PRICE IN POOLS PLATFORM:
          <h4>
            vUSD Price = {pools.length > 0 ? pools[0].price : <p>Loading Price</p>} USD
          </h4>
          <h6>
            <a
              className="App-link"
              href="https://pools-frontend-v2-diss-nakama.vercel.app/pool/0xd04978fce521e644ebddaa1aabcad6d36b518d34000200000000000000000005"
              target="_blank"
              rel="wSMRv/VUSD Pool in POOLS"
            >
              wSMRv/VUSD Pool in POOLS
            </a>
          </h6>
        </p>

        <p>
            PRICE IN POOLS SHIMMERSEA:
          <h4>
            vUSD Price = {pools.length > 0 ? pools[1].price : <p>Loading Price</p>} USD
          </h4>
          <h6>
            <a
              className="App-link"
              href="https://www.google.com"
              target="_blank"
              rel="wSMRv/VUSD Pool in POOLS"
            >
              wSMRv/VUSD Pool in ShimmerSea
            </a>
          </h6>
        </p>
      </header>
    </div>
  );
}

export default App;