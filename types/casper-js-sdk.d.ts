/**
 * Type declarations for casper-js-sdk
 * Used by Vera's Casper AgentAttest integration.
 * The SDK is lazily loaded (webpackIgnore + try/catch) so
 * it won't break builds even when uninstalled.
 */
declare module 'casper-js-sdk' {
  export const CasperClient: any;
  export const Contracts: any;
  export const RuntimeArgs: any;
  export const DeployUtil: any;
  export const Keys: any;
}
