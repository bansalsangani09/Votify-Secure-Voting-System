import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ElectionModule = buildModule("ElectionModule", (m) => {
    const election = m.contract("ElectionFactory");

    return { election };
});

export default ElectionModule;
