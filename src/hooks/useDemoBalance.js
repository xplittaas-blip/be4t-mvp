/**
 * useDemoBalance — BE4T Global Identity Hook (Context Proxy)
 * ─────────────────────────────────────────────────────────────────────────────
 * This hook now acts as a proxy for the DemoBalanceContext.
 * It ensures that every component in the app shares a single source of truth.
 *
 * All state management (persistence, DB sync, balance calculation) 
 * has been moved to src/context/DemoBalanceContext.jsx.
 */

import { useDemoBalanceGlobal } from '../context/DemoBalanceContext';

/**
 * useDemoBalance
 * Returns the global investment state and methods.
 * No arguments needed anymore as userId/walletAddress are handled by the Provider.
 */
export function useDemoBalance() {
    return useDemoBalanceGlobal();
}

export default useDemoBalance;
