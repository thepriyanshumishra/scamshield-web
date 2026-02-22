// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ScamLedger
 * @notice Public on-chain ledger for storing scam message fingerprints.
 * @dev Deployed on Polygon Amoy Testnet.
 *
 * How it works:
 *   1. Backend hashes a detected scam message (SHA-256).
 *   2. Calls addScamHash() with the hash + category string.
 *   3. Anyone can query the ledger via getTotalScams() / getScamByIndex().
 */
contract ScamLedger {

    // ── Data structure ──────────────────────────────────────────────────────

    struct ScamEntry {
        string  hash;       // SHA-256 hex hash of the scam message
        string  category;   // e.g. "bank scam", "phishing", "lottery scam"
        uint256 timestamp;  // block timestamp at the time of submission
    }

    // ── Storage ─────────────────────────────────────────────────────────────

    ScamEntry[] private scams;

    // ── Events ──────────────────────────────────────────────────────────────

    event ScamAdded(
        uint256 indexed index,
        string  hash,
        string  category,
        uint256 timestamp
    );

    // ── Functions ───────────────────────────────────────────────────────────

    /**
     * @notice Add a scam fingerprint to the ledger.
     * @param _hash     SHA-256 hex string of the scam text.
     * @param _category Human-readable scam category.
     */
    function addScamHash(string calldata _hash, string calldata _category)
        external
    {
        ScamEntry memory entry = ScamEntry({
            hash:      _hash,
            category:  _category,
            timestamp: block.timestamp
        });

        scams.push(entry);

        emit ScamAdded(scams.length - 1, _hash, _category, block.timestamp);
    }

    /**
     * @notice Returns the total number of scams stored.
     */
    function getTotalScams() external view returns (uint256) {
        return scams.length;
    }

    /**
     * @notice Returns a scam entry by index.
     * @param index Position in the scams array (0-based).
     * @return hash      The scam message hash.
     * @return category  The scam category.
     * @return timestamp When it was stored (block timestamp).
     */
    function getScamByIndex(uint256 index)
        external
        view
        returns (
            string memory hash,
            string memory category,
            uint256       timestamp
        )
    {
        require(index < scams.length, "Index out of bounds");
        ScamEntry storage entry = scams[index];
        return (entry.hash, entry.category, entry.timestamp);
    }
}
