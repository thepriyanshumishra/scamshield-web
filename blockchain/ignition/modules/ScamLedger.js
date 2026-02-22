import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScamLedgerModule", (m) => {
    const scamLedger = m.contract("ScamLedger");
    return { scamLedger };
});
