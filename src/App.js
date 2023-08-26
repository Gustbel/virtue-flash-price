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
  const [generalPrice, setGeneralPrice] = useState();
  const [marketCap, setMarketCap] = useState();


  useEffect(() => {
    async function setPrices() {
      const provider = new JsonRpcProvider('https://json-rpc.evm.testnet.shimmer.network');

      // Set Pool Array to empty
      poolArray = [];

      // Get price from Pools
      const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
      const pool1PoolsRawInfo = await vault.getPoolTokens(poolId);
      const pool1PoolsWsmrBalance = Number(ethers.formatUnits(String(pool1PoolsRawInfo[1][0]), 18))
      const pool1PoolsVusdBalance = Number(ethers.formatUnits(String(pool1PoolsRawInfo[1][1]), 18))
      let poolCotization = pool1PoolsWsmrBalance/pool1PoolsVusdBalance
      const pool1PoolsVusdPrice = poolCotization * wsmrPrice
      const pool1PoolsCap = pool1PoolsWsmrBalance * wsmrPrice + pool1PoolsVusdBalance * pool1PoolsVusdPrice


      // Get price from ShimmerSea
      const shimmerSeaPool = new ethers.Contract(shimmerSeaPoolAddress, tangleseaPairAbi, provider);
      const pool1SseaRawInfo = await shimmerSeaPool.getReserves()
      const pool1SseaWsmrBalance = Number(ethers.formatUnits(String(pool1SseaRawInfo[0]), 18))
      const pool1SseaVusddBalance = Number(ethers.formatUnits(String(pool1SseaRawInfo[1]), 18))
      poolCotization = pool1SseaWsmrBalance/pool1SseaVusddBalance
      const pool1SseaVusdPrice = poolCotization * wsmrPrice
      const pool1SseaCap = pool1SseaWsmrBalance * wsmrPrice + pool1SseaVusddBalance * pool1SseaVusdPrice
      
      // Dominance calculation
      const marketCap = pool1PoolsCap + pool1SseaCap
      const pool1PoolsDominance = pool1PoolsCap / marketCap
      const pool1SseaDominance = pool1SseaCap /marketCap

      // Final Price
      const ponderatedPrice = (pool1PoolsVusdPrice * pool1PoolsDominance) + (pool1SseaVusdPrice * pool1SseaDominance)

      addPool(
        pool1PoolsVusdPrice.toFixed(5), 
        pool1PoolsWsmrBalance.toFixed(0), 
        pool1PoolsVusdBalance.toFixed(0), 
        pool1PoolsCap.toFixed(0), 
        (pool1PoolsDominance * 100).toFixed(2)
      )
      addPool(
        (1.00).toFixed(5), 
        (123).toFixed(0), 
        (123).toFixed(0), 
        (246).toFixed(0), 
        (15).toFixed(2)
      )
      addPool(
        pool1SseaVusdPrice.toFixed(5), 
        pool1SseaWsmrBalance.toFixed(0), 
        pool1SseaVusddBalance.toFixed(0), 
        pool1SseaCap.toFixed(0), 
        (pool1SseaDominance * 100).toFixed(2)
      )
      addPool(
        (1.00).toFixed(5), 
        (423).toFixed(0), 
        (423).toFixed(0), 
        (846).toFixed(0), 
        (30).toFixed(2)
      )
      setPools(poolArray)

      setGeneralPrice(ponderatedPrice.toFixed(5))
      setMarketCap(marketCap.toFixed(0))
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

          <h2>
            vUSD PRICE = {generalPrice} USD*
          </h2>
          <h6>
            * Composition of the price obtained from Pools and ShimmerSea pools and their weighting by their capitalizations. <br></br> 
            Note: The reference with USD DOLLAR is made with the HARCODED Price of WSMR = 0.05 USD
          </h6>
        </p>

        <p>
            PRICE IN POOLS PLATFORM:
          <div class="container">
            <div class="column">
              <h4>
              Pool1: wSMR/vUSD
              </h4>
            </div>
            <div class="column">
              <h3>
              vUSD Price = {pools.length > 0 ? pools[0].price : <p>Loading Price</p>} USD
              </h3>
            </div>
            <div class="column">
              <h6>
                <p> Pool Capitalization in USD: {pools.length > 0 ? pools[0].capitalization : <p>Loading Cap</p>} USD  </p>
                <p> Pool Dominance in Market: {pools.length > 0 ? pools[0].dominance : <p>Loading Dom</p>}%  </p>
                <p> Pool Balances: [{pools.length > 0 ? pools[0].wsmrBalance : <p> </p>} wSMR, {pools.length > 0 ? pools[0].vusddBalance : <p> </p>} vUSD] </p>
                <a
                  className="App-link"
                  href="https://pools-frontend-v2-diss-nakama.vercel.app/pool/0xd04978fce521e644ebddaa1aabcad6d36b518d34000200000000000000000005"
                  target="_blank"
                  rel="wSMRv/VUSD Pool in POOLS"
                >
                  wSMRv/VUSD Pool in POOLS
                </a>
              </h6>
            </div>
          </div>
          <div class="container">
            <div class="column">
              <h4>
              Pool2: USDT/vUSD
              </h4>
            </div>
            <div class="column">
              <h3>
              vUSD Price = {pools.length > 0 ? pools[1].price : <p>Loading Price</p>} USD
              </h3>
            </div>
            <div class="column">
              <h6>
                <p> Pool Capitalization in USD: {pools.length > 0 ? pools[1].capitalization : <p>Loading Cap</p>} USD  </p>
                <p> Pool Dominance in Market: {pools.length > 0 ? pools[1].dominance : <p>Loading Dom</p>}%  </p>
                <p> Pool Balances: [{pools.length > 0 ? pools[1].wsmrBalance : <p> </p>} wSMR, {pools.length > 0 ? pools[1].vusddBalance : <p> </p>} vUSD] </p>
                <a
                  className="App-link"
                  href="https://pools-frontend-v2-diss-nakama.vercel.app/pool/0xd04978fce521e644ebddaa1aabcad6d36b518d34000200000000000000000005"
                  target="_blank"
                  rel="USDT/VUSD Pool in POOLS"
                >
                  USDT/VUSD Pool in POOLS
                </a>
              </h6>
            </div>
          </div>
        </p>

        <p>
            PRICE IN POOLS SHIMMERSEA:
          <div class="container">
            <div class="column">
              <h4>
              Pool1: wSMR/vUSD
              </h4>
            </div>
            <div class="column">
              <h3>
              vUSD Price = {pools.length > 0 ? pools[2].price : <p>Loading Price</p>} USD
              </h3>
            </div>
            <div class="column">
              <h6>
                <p> Pool Capitalization in USD: {pools.length > 0 ? pools[2].capitalization : <p>Loading Cap</p>} USD  </p>
                <p> Pool Dominance in Market: {pools.length > 0 ? pools[2].dominance : <p>Loading Dom</p>}%  </p>
                <p> Pool Balances: [{pools.length > 0 ? pools[2].wsmrBalance : <p> </p>} wSMR, {pools.length > 0 ? pools[2].vusddBalance : <p> </p>} vUSD] </p>
                <a
                  className="App-link"
                  href="https://pools-frontend-v2-diss-nakama.vercel.app/pool/0xd04978fce521e644ebddaa1aabcad6d36b518d34000200000000000000000005"
                  target="_blank"
                  rel="wSMRv/VUSD Pool in SHIMMERSEA"
                >
                  wSMRv/VUSD Pool in POOLS
                </a>
              </h6>
            </div>
          </div>
          <div class="container">
            <div class="column">
              <h4>
              Pool2: USDT/vUSD
              </h4>
            </div>
            <div class="column">
              <h3>
              vUSD Price = {pools.length > 0 ? pools[3].price : <p>Loading Price</p>} USD
              </h3>
            </div>
            <div class="column">
              <h6>
                <p> Pool Capitalization in USD: {pools.length > 0 ? pools[3].capitalization : <p>Loading Cap</p>} USD  </p>
                <p> Pool Dominance in Market: {pools.length > 0 ? pools[3].dominance : <p>Loading Dom</p>}%  </p>
                <p> Pool Balances: [{pools.length > 0 ? pools[3].wsmrBalance : <p> </p>} wSMR, {pools.length > 0 ? pools[3].vusddBalance : <p> </p>} vUSD] </p>
                <a
                  className="App-link"
                  href="https://pools-frontend-v2-diss-nakama.vercel.app/pool/0xd04978fce521e644ebddaa1aabcad6d36b518d34000200000000000000000005"
                  target="_blank"
                  rel="USDT/VUSD Pool in SHIMMERSEA"
                >
                  USDT/VUSD Pool in POOLS
                </a>
              </h6>
            </div>
          </div>
        </p>
      </header>
    </div>
  );
}

export default App;