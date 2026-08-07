/**
 * CODEXEDOC Authentication Layer Entry Point.
 *
 * Exposes core auth types, contract, gateway singleton, providers, session store,
 * cookies, tokens, and errors.
 *
 * @see ADR-002 — Authentication Architecture
 */

export * from "./types";
export * from "./contracts/IAuthProvider";
export * from "./gateway/serverAuth";
export * from "./providers/LocalDevAuthProvider";
export * from "./providers/ProductionAuthProvider";
export * from "./session";
export * from "./utils";
export * from "./errors";
