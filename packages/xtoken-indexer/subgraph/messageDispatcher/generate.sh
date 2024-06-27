function dispatch() {
  echo "specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum/contract
    name: ormp
    network: $1
    source:
      address: \"$2\"
      abi: ormp
      startBlock: $3
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - MessageDispatched
      abis:
        - name: ormp
          file: ./abis/ormp.json
      eventHandlers:
        - event: MessageDispatched(indexed bytes32,bool)
          handler: handleMessageDispatched
      file: ./src/dispatch.ts" > subgraph.yaml
}

function messager() {
echo "  - kind: ethereum/contract
    name: $1 
    network: $2
    source:
      address: \"$3\"
      abi: MsglineMessager
      startBlock: $4
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - CallResult
      abis:
        - name: MsglineMessager
          file: ./abis/MsglineMessager.json
      eventHandlers:
        - event: CallResult(uint256,bool)
          handler: handleCallResult
          receipt: true
      file: ./src/dispatch.ts" >> subgraph.yaml
}

function guard() {
echo "  - kind: ethereum/contract
    name: Guard
    network: $1
    source:
      address: \"$2\"
      abi: Guard
      startBlock: $3
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - TokenDeposit
        - TokenClaimed
      abis:
        - name: Guard
          file: ./abis/Guard.json
      eventHandlers:
        - event: TokenDeposit(address,uint256,uint256,address,uint256,bytes)
          handler: handleTokenDeposit
        - event: TokenClaimed(uint256)
          handler: handleTokenClaimed
      file: ./src/guard.ts" >> subgraph.yaml
}

`$1 $2 $3 $4 $5`
