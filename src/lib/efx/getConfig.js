const Web3 = require('web3')
const { ExchangeWrapper } = require('@0x/contract-wrappers')
const { Web3Wrapper } = require('@0x/web3-wrapper')
const {post} = require('request-promise')
const mapWrapperAddressToToken = require('./mapWrapperAddressToToken')

let config = {
  networkId: 1,
  web3ProviderUrl: process.env.WEB3_PROVIDER,
  configUrl: 'https://api.ethfinex.com/trustless/v1/r/get/conf',
  tokenMap: {}, // maps tokenAddress to token symbol
  exchangeAddress: '', // fetched from the API
  tokenRegistry: {} // fetched from the API
}

let cached = false

module.exports = async (reload = false) => {
  // only fetch config once per execution
  if (cached && !reload) {
    return config
  }

  const efxConfig = await post(config.configUrl, {json: {}})

  cached = true

  config = {
    ...config,
    ...efxConfig['0x']
  }

  config.web3 = new Web3(config.web3ProviderUrl)

  config.tokenMap = mapWrapperAddressToToken(config.tokenRegistry)

  const web3Provider = new Web3.providers.HttpProvider(config.web3ProviderUrl)

  config.exchangeWrapper = new ExchangeWrapper(
    new Web3Wrapper(web3Provider),
    config.networkId,
    null,
    null,
    config.exchangeAddress
  )

  return config
}
