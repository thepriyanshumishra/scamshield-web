import os
import json
from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

load_dotenv()

RPC_URL = os.getenv("WEB3_PROVIDER_URI", "https://rpc-amoy.polygon.technology")
PRIVATE_KEY = os.getenv("WALLET_PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("SCAM_LEDGER_ADDRESS")

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(RPC_URL))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

# Load ABI
abi_path = os.path.join(os.path.dirname(__file__), "ScamLedgerABI.json")
try:
    with open(abi_path, "r") as f:
        CONTRACT_ABI = json.load(f)
except FileNotFoundError:
    CONTRACT_ABI = []
    print("WARNING: ScamLedgerABI.json not found!")

if CONTRACT_ADDRESS and CONTRACT_ABI:
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
else:
    contract = None

def add_scam_to_ledger(message_hash: str, category: str) -> str:
    """
    Sends a transaction to the Polygon Amoy blockchain to store a scam hash.
    Returns the transaction hash as a hex string.
    """
    if not contract or not PRIVATE_KEY:
        raise Exception("Blockchain not configured properly (missing contract or private key)")

    account = w3.eth.account.from_key(PRIVATE_KEY)
    
    # Estimate gas needed
    estimated_gas = contract.functions.addScamHash(message_hash, category).estimate_gas({'from': account.address})
    
    # Get current fee data for EIP-1559 transaction
    base_fee = w3.eth.get_block('latest').baseFeePerGas
    max_priority_fee = w3.eth.max_priority_fee
    max_fee = base_fee * 2 + max_priority_fee
    
    # Get latest nonce
    nonce = w3.eth.get_transaction_count(account.address)
    
    # Build transaction
    transaction = contract.functions.addScamHash(message_hash, category).build_transaction({
        'chainId': 80002, # Amoy chain ID
        'gas': estimated_gas + 20000, # small cushion
        'maxFeePerGas': max_fee,
        'maxPriorityFeePerGas': max_priority_fee,
        'nonce': nonce,
    })
    
    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)
    
    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    
    # We will wait for the receipt to ensure the frontend gets the 100% saved confirmation.
    # Polygon blocks are ~2 seconds, so this is fast enough for a good UX.
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if receipt.status != 1:
        raise Exception("Transaction failed on-chain")
        
    return tx_hash.hex()

def get_all_scams() -> list:
    """
    Fetches all scams from the blockchain.
    Returns a list of dictionaries: [{"hash": "...", "category": "...", "timestamp": int}]
    """
    if not contract:
        return []
        
    total_scams = contract.functions.getTotalScams().call()
    
    results = []
    # Fetch in reverse order (newest first). Unbounded loops in RPC are normally bad, 
    # but for a hackathon MVP this is perfectly fine. We'll limit it to the last 100 so it doesn't timeout.
    
    limit = min(total_scams, 100)
    for i in range(total_scams - 1, total_scams - 1 - limit, -1):
        try:
            scam_data = contract.functions.getScamByIndex(i).call()
            # scam_data is a tuple: (string hash, string category, uint256 timestamp)
            results.append({
                "hash": scam_data[0],
                "category": scam_data[1],
                "timestamp": scam_data[2]
            })
        except Exception as e:
            print(f"Error fetching index {i}: {e}")
            break
            
    return results
