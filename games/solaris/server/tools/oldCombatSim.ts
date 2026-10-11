export interface Defender {
    ships: number;
    weaponsLevel: number;
}

export interface Attacker {
    ships: number;
    weaponsLevel: number;
}

export interface CombatWeapons {
    defender: number;
    defenderBase: number;
    attacker: number;
    attackerBase: number;
}

export interface CombatPart {
    defender: number;
    attacker: number;
}

export interface CombatResultShips {
    weapons: CombatWeapons;
    before: CombatPart;
    after: CombatPart;
    lost: CombatPart;
    needed?: CombatPart | null;
}

export default class CombatService {
    calculate(
        defender: Defender,
        attacker: Attacker,
        isTurnBased: boolean = true,
        calculateNeeded: boolean = false,
    ): CombatResultShips {
        let defenderShipsRemaining = defender.ships;
        let attackerShipsRemaining = attacker.ships;

        let defendPowerBase = defender.weaponsLevel;
        let attackPowerBase = attacker.weaponsLevel;
        let defendPower = defender.weaponsLevel;
        let attackPower = attacker.weaponsLevel;

        // If in non-turn based mode the attacker/defender cannot survive a single blow
        // then they should outright be destroyed without delivering a blow to the opposition.
        // Note: This addresses an exploit where players can send out 1 ship carriers to chip away
        // at incoming carriers.
        if (!isTurnBased) {
            if (defender.ships <= attacker.weaponsLevel) {
                defendPower = 1;
            }

            if (attacker.ships <= defender.weaponsLevel) {
                attackPower = 1;
            }
        }

        const defenderAdditionalTurns = isTurnBased ? 1 : 0;

        const defenderTurns = Math.ceil(attacker.ships / defendPower);
        const attackerTurns = Math.ceil(defender.ships / attackPower);

        let needed: CombatPart | null = null;

        if (defenderTurns <= attackerTurns) {
            attackerShipsRemaining = 0;
            defenderShipsRemaining =
                defender.ships -
                (defenderTurns - defenderAdditionalTurns) * attackPower;

            if (calculateNeeded) {
                needed = {
                    defender: 0,
                    attacker: attackerTurns * defendPower + 1,
                };
            }
        } else {
            defenderShipsRemaining = 0;
            attackerShipsRemaining =
                attacker.ships - attackerTurns * defendPower;

            if (calculateNeeded) {
                needed = {
                    attacker: 0,
                    defender:
                        (defenderTurns - defenderAdditionalTurns) *
                            attackPower +
                        defenderAdditionalTurns,
                };
            }
        }

        attackerShipsRemaining = Math.max(0, attackerShipsRemaining);
        defenderShipsRemaining = Math.max(0, defenderShipsRemaining);

        let result: CombatResultShips = {
            weapons: {
                defender: defendPower,
                defenderBase: defendPowerBase,
                attacker: attackPower,
                attackerBase: attackPowerBase,
            },
            before: {
                defender: defender.ships,
                attacker: attacker.ships,
            },
            after: {
                defender: defenderShipsRemaining,
                attacker: attackerShipsRemaining,
            },
            lost: {
                defender: defender.ships - defenderShipsRemaining,
                attacker: attacker.ships - attackerShipsRemaining,
            },
        };

        if (calculateNeeded) {
            result.needed = needed;
        }

        return result;
    }
}

const USAGE = `
Usage: tsx tools/oldCombatSim.ts <defenderShips> <defenderWeaponsLevel> <attackerShips> <attackerWeaponsLevel> [options]

Options:
  --non-turn-based    Run in non-turn-based mode (default: turn-based)
  --calculate-needed  Calculate ships needed to guarantee a win

Example:
  tsx tools/oldCombatSim.ts 100 5 50 7 --calculate-needed
`;

function printResult(result: CombatResultShips, isTurnBased: boolean) {
    const divider = "\u2500".repeat(20);
    const padNum = (n: number) => String(n).padStart(8);

    console.log();
    console.log(`  ${divider}`);
    console.log(`  COMBAT SIMULATION RESULTS`);
    console.log(`  ${divider}`);
    console.log();
    console.log(`  Ships          Defender   Attacker`);
    console.log(`  ${divider}`);
    console.log(
        `  Before        ${padNum(result.before.defender)}  ${padNum(result.before.attacker)}`,
    );
    console.log(
        `  After         ${padNum(result.after.defender)}  ${padNum(result.after.attacker)}`,
    );
    console.log(
        `  Lost          ${padNum(result.lost.defender)}  ${padNum(result.lost.attacker)}`,
    );
    console.log(`  ${divider}`);
    console.log(
        `  Weapons       ${padNum(result.weapons.defender)}  ${padNum(result.weapons.attacker)}`,
    );
    if (
        result.weapons.defender !== result.weapons.defenderBase ||
        result.weapons.attacker !== result.weapons.attackerBase
    ) {
        console.log(
            `  (Base)        ${padNum(result.weapons.defenderBase)}  ${padNum(result.weapons.attackerBase)}`,
        );
    }
    console.log(`  ${divider}`);
    console.log(`  Mode: ${isTurnBased ? "Turn-based" : "Non-turn-based"}`);

    if (result.needed) {
        console.log();
        console.log(`  Ships needed to win:`);
        if (result.needed.attacker > 0) {
            console.log(`    Attacker needs ${result.needed.attacker} ships`);
        }
        if (result.needed.defender > 0) {
            console.log(`    Defender needs ${result.needed.defender} ships`);
        }
    }

    console.log();
}

if (
    process.argv[1]?.endsWith("oldCombatSim.ts") ||
    process.argv[1]?.endsWith("oldCombatSim.js")
) {
    const args = process.argv.slice(2);

    if (args.includes("-h") || args.includes("--help") || args.length < 4) {
        console.log(USAGE);
        process.exit(0);
    }

    const defenderShips = parseInt(args[0], 10);
    const defenderWeapons = parseInt(args[1], 10);
    const attackerShips = parseInt(args[2], 10);
    const attackerWeapons = parseInt(args[3], 10);

    if (
        [defenderShips, defenderWeapons, attackerShips, attackerWeapons].some(
            isNaN,
        )
    ) {
        console.error(
            "Error: All four numeric arguments must be valid numbers.",
        );
        console.log(USAGE);
        process.exit(1);
    }

    if (
        [defenderShips, defenderWeapons, attackerShips, attackerWeapons].some(
            (n) => n < 0,
        )
    ) {
        console.error("Error: All values must be non-negative.");
        process.exit(1);
    }

    const isTurnBased = !args.includes("--non-turn-based");
    const calculateNeeded = args.includes("--calculate-needed");

    const service = new CombatService();
    const result = service.calculate(
        { ships: defenderShips, weaponsLevel: defenderWeapons },
        { ships: attackerShips, weaponsLevel: attackerWeapons },
        isTurnBased,
        calculateNeeded,
    );

    printResult(result, isTurnBased);
}
