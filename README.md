<img src="https://avatars3.githubusercontent.com/u/33315316?s=200&v=4" align="right" />

# EFX Trustless Data

  Constantly wait for new blocks and sync Fill events.

  Currently saves data into 3 collections
   - Blocks
   - Transactions
   - Events ( currently 'Fill' events)

  Data Structures are documented on the [models folder](./src/models)

# Example endpoints

  - return an specific block: /api/v1/block/8232895

  - return an specific tx: /api/v1/transactions/0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110

  - return an specific event: /api/v1/events/0x6a502fab01e83e41b1f0dba0448800ccee7e8a379823b938ecf6e12e5491a110-45

  - return all events where address is a maker /api/v1/maker/0xf63246f4df508eba748df25daa8bd96816a668ba

  - return all events where address is a taker /api/v1/maker/0xf63246f4df508eba748df25daa8bd96816a668ba

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

