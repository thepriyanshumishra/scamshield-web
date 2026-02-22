import os
import json
from web3 import Web3
from solcx import install_solc, compile_source

# 1. Install and Set Solc Version
print("🔌 Installing solc 0.8.20...")
install_solc('0.8.20')
from solcx import set_solc_version
set_solc_version('0.8.20')

def deploy_contract():
    # 2. Setup Web3 Client
    rpc_url = "https://rpc-amoy.polygon.technology"
    private_key = "0x9677ad780d82f6727dbb6b47a094fbe1c8a19c7916449f182ac84079099a0251"
    
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    # Inject POA middleware for Polygon Amoy
    from web3.middleware import ExtraDataToPOAMiddleware
    w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
    
    assert w3.is_connected(), "Failed to connect to Polygon Amoy RPC"
    
    account = w3.eth.account.from_key(private_key)
    print(f"🔗 Connected to Amoy. Deploying from: {account.address}")
    
    # 3. Read Solidity source code
    contract_path = os.path.join(os.path.dirname(__file__), '../blockchain/contracts/ScamLedger.sol')
    with open(contract_path, 'r') as file:
        scam_ledger_source = file.read()
    
    # 4. Compile Contract
    print("🔨 Compiling ScamLedger.sol...")
    compiled_sol = compile_source(scam_ledger_source)
    contract_interface = compiled_sol['<stdin>:ScamLedger']
    
    # Extract ABI and Bytecode
    abi = contract_interface['abi']
    bytecode = contract_interface['bin']
    
    # Save the ABI locally for the backend to use later
    with open(os.path.join(os.path.dirname(__file__), 'ScamLedgerABI.json'), 'w') as f:
        json.dump(abi, f)
    
    # 5. Deploy Contract
    print("🚀 Initiating deployment transaction...")
    ScamLedger = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Estimate gas needed
    estimated_gas = ScamLedger.constructor().estimate_gas()
    
    # Get current fee data for EIP-1559 transaction
    base_fee = w3.eth.get_block('latest').baseFeePerGas
    max_priority_fee = w3.eth.max_priority_fee
    max_fee = base_fee * 2 + max_priority_fee
    
    # Get latest nonce and construct transaction
    nonce = w3.eth.get_transaction_count(account.address)
    
    # We only have 0.1 MATIC, so make sure tx cost won't exceed it
    
    # Build EIP-1559 transaction
    transaction = ScamLedger.constructor().build_transaction({
        'chainId': 80002, # Amoy chain ID
        'gas': estimated_gas + 50000, # cushion
        'maxFeePerGas': max_fee,
        'maxPriorityFeePerGas': max_priority_fee,
        'nonce': nonce,
    })
    
    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    
    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction) # Web3 v6 uses raw_transaction instead of rawTransaction
    print(f"⏳ Transaction sent! Hash: {tx_hash.hex()}")
    
    # Wait for the receipt
    print("🔄 Waiting for block confirmation...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"✅ Contract deployed successfully!")
    print(f"📍 Contract Address: {tx_receipt.contractAddress}")
    print(f"💡 Save this address to your backend .env file as SCAM_LEDGER_ADDRESS")

if __name__ == "__main__":
    deploy_contract()
