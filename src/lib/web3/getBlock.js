/**
 * Sometimes infura returns null for the current block, in this case we need
 * to retry until we get the block as the application completely depends
 * on this information.
 *
 * See: https://github.com/INFURA/infura/issues/43
 *
 */
const sleep = require('sleep-promise')
const getEfxConfig = require('../efx/getConfig')

module.exports = async (blockNumber = 'latest') =>{

  const config = await getEfxConfig()

  let block = null

  while(block == null){
    block = await config.web3.eth.getBlock(blockNumber)

    if(!block) {
      await sleep(2000)
    }
  }

  return block
}
