export {
  CanonicalSingleAuthority as AuthoritativeSimulation,
  CANONICAL_AUTHORITY_CONSTANTS as SIMULATION_CONSTANTS
} from "./canonical-single-runtime.mjs";

export function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function radiusFromMass(mass, minimumRadius = 4) {
  const value = Number.isFinite(Number(mass)) ? Number(mass) : 1;
  return Math.max(minimumRadius, Math.sqrt(Math.max(1, value)) * 4);
}
