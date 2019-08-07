const getEfxConfig = require('../../lib/efx/getConfig')

const { assetDataUtils } = require('@0x/order-utils')
const BigNumber = require('bignumber.js')
const getBlock = require('../web3/getBlock')

/**
 *
 * Fetch fill logs for a given range ( of blocks ) doing several async
 * calls to web3 provider
 *
 */
module.exports = async (range) => {
  // fetches basic app config / info
  const config = await getEfxConfig()

  const fillRange = {
    fromBlock: range.fromBlock.number,
    toBlock: range.toBlock.number
  }

  // request 'Fill' from zeroEx's exchange
  const logs = await config.exchangeWrapper.getLogsAsync(
    'Fill',
    fillRange,
    {feeRecipientAddress: config.ethfinexAddress}
  )

  // calculates volume per token
  const tokensSet = new Set()

  // save a tree data parsed in block > txHash > Fill(s)
  const blocks = {}

  for (const log of logs) {
    // parse event data
    const takerAssetData = assetDataUtils.decodeERC20AssetData(log.args.takerAssetData)
    const takerToken = config.tokenMap[takerAssetData.tokenAddress]

    const makerAssetData = assetDataUtils.decodeERC20AssetData(log.args.makerAssetData)
    const makerToken = config.tokenMap[makerAssetData.tokenAddress]

    tokensSet.add(makerToken)
    tokensSet.add(takerToken)

    const takerAddress = log.args.takerAddress
    const takerAmount = new BigNumber(log.args.takerAssetFilledAmount)
      .shiftedBy(-1 * config.tokenRegistry[takerToken].decimals)

    const makerAddress = log.args.makerAddress
    const makerAmount = new BigNumber(log.args.makerAssetFilledAmount)
      .shiftedBy(-1 * config.tokenRegistry[makerToken].decimals)

    // prepare the hashmap of Events
    if (!blocks[log.blockNumber]) {
      // blocks[blockNumber] will house all TX done in this range of logs
      blocks[log.blockNumber] = {
        transactions: {}
      }

      // every block carries exchangeWrapper and ethfinexAddress so they are
      // kept unique in the database in case it happens we need to scan
      // the same block for a different exchangeWrapper or feeRecipient
      const block = await getBlock(log.blockNumber)

      blocks[log.blockNumber].timestamp = block.timestamp
      blocks[log.blockNumber].date = new Date(block.timestamp * 1000)
      blocks[log.blockNumber].exchangeWrapper = config.exchangeWrapper.address
      blocks[log.blockNumber].feeRecipientAddress = config.ethfinexAddress
    }

    if (!blocks[log.blockNumber].transactions[log.transactionHash]) {
      // blocks[blockNumber][transactionHash] will house all Fill
      // events that happened
      const tx = blocks[log.blockNumber].transactions[log.transactionHash] = {
        events: []
      }

      const receipt = await config.web3.eth.getTransactionReceipt(log.transactionHash)
      const transaction = await config.web3.eth.getTransaction(log.transactionHash)

      tx.gasUsed = receipt.gasUsed
      tx.gasPrice = transaction.gasPrice
    }

    const events = blocks[log.blockNumber].transactions[log.transactionHash].events

    const event = {
      type: 'Fill',
      logIndex: log.logIndex,
      maker: {
        address: makerAddress,
        token: makerToken,
        tokenAddress: makerAssetData.tokenAddress,
        amount: makerAmount.toPrecision()
      },
      taker: {
        address: takerAddress,
        token: takerToken,
        tokenAddress: takerAssetData.tokenAddress,
        amount: takerAmount.toPrecision()
      }
    }

    events.push(event)
  }

  return blocks
}
