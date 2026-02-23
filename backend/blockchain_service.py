import os
import json
import uuid
import time

# Mock Database File for Hackathon Demo
DB_FILE = os.path.join(os.path.dirname(__file__), "scams.json")

def _load_data() -> list:
    """Helper to load the mock ledger data from the JSON file."""
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {DB_FILE}: {e}")
        return []

def _save_data(data: list) -> None:
    """Helper to save the mock ledger data to the JSON file."""
    try:
        with open(DB_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing {DB_FILE}: {e}")

def add_scam_to_ledger(message_hash: str, category: str) -> str:
    """
    Simulates sending a transaction to the blockchain.
    Stores the scam data in a local JSON file to guarantee it works flawlessly for demos.
    Returns a realistic-looking fake transaction hash.
    """
    data = _load_data()
    
    new_record = {
        "hash": message_hash,
        "category": category,
        "timestamp": int(time.time()),
    }
    
    data.append(new_record)
    _save_data(data)
    
    # Generate a fake Web3 transaction hash (e.g., 0xb9a32f...)
    fake_tx_hash = "0x" + str(uuid.uuid4()).replace("-", "") + str(uuid.uuid4()).replace("-", "")
    return fake_tx_hash

def get_all_scams() -> list:
    """
    Fetches all scams from the mock JSON ledger.
    Returns a list of dictionaries: [{"hash": "...", "category": "...", "timestamp": int}]
    """
    data = _load_data()
    
    # The frontend expects them in order, but the original contract 
    # fetched them newest first. We reverse the list to match the Web3 behavior.
    return list(reversed(data))
