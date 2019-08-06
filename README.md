<img src="https://avatars3.githubusercontent.com/u/33315316?s=200&v=4" align="right" />

# EFX Trustless Data

  Constantly wait for new blocks and sync Fill events.

  Currently saves data into 3 collections
   - Blocks
   - Transactions
   - Events ( currently 'Fill' events)

  Data Structures are documented on the [models folder](./src/models)

# Example endpoints

  - [/api/v1/block/8232895](https://efx-trustless-data.herokuapp.com/api/v1/block/8232895)
    - Return information for block #8232895

  - [/api/v1/transaction/0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110](https://efx-trustless-data.herokuapp.com/api/v1/transaction/0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110)
    - Return information for transaction hash: 0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110

  - [/api/v1/events/0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110-45](https://efx-trustless-data.herokuapp.com/api/v1/events/0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110-45)
    - Return information for event id: 0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110-45

  - [/api/v1/maker/0xf63246f4df508eba748df25daa8bd96816a668ba](https://efx-trustless-data.herokuapp.com/api/v1/maker/0xf63246f4df508eba748df25daa8bd96816a668ba)
    - Return all events where maker address is 0xf63246f4df508eba748df25daa8bd96816a668ba

  -  [/api/v1/taker/0xf63246f4df508eba748df25daa8bd96816a668ba](https://efx-trustless-data.herokuapp.com/api/v1/taker/0xf63246f4df508eba748df25daa8bd96816a668ba)
    - Return all events where taker address is 0xf63246f4df508eba748df25daa8bd96816a668ba

  - [/api/v1/tokenRanking/ETH](https://efx-trustless-data.herokuapp.com/api/v1/tokenRanking/ETH)
    - Return all time volume ranking quoted in ETH
    - Providing `startDate` unix timestamp in millieconds ) for 18/07/2019 UTC-0
    - Providing `endDate` unix timestamp in millieconds ) for 25/07/2019 UTC-0

  - [/api/v1/tokenRanking/ETH?startDate=1564620468000&endDate=1564620469000](https://efx-trustless-data.herokuapp.com/api/v1/tokenRanking/ETH?startDate=1564620468000&endDate=1564620469000)
    - Return volume ranking quoted in ETH
    - Providing `startDate` unix timestamp in millieconds ) for 2019-08-01 00:47:48.000Z
    - Providing `endDate` unix timestamp in millieconds ) for 2019-08-01 00:47:49.000Z



# Example reports

  - TODO - user volume ranking in USD value and per coin

  - TODO - ....

## Developing

1. `npm run develop`

Note: you should update .env file with your own INFURA web3 provider address

## Testing

1. `npm run test:watch`

Once you update tests you must delete ./tests/fixtures and run tests again.

Once the tests are ran once the HTTP requests will be cached and the tests will
run offline using the recorded HTTP responses found on ./tests/fixtures

### You can also deploy your own version to heroku

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

