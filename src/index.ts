import { PublicClientApplication, Configuration, DeviceCodeRequest } from '@azure/msal-node'

export type RequestsType = {
  scopes: string[]
}

async function acquireTokens(requests: RequestsType[], pca: PublicClientApplication) {
  // check if account is logged in
  const allAccounts = await pca.getTokenCache().getAllAccounts()

  if (allAccounts.length < 1) {
    throw new Error('No accounts after device login.')
  }

  // acquire tokens for each request
  for (let request of requests) {
    const silentRequest = {
      ...request,
      account: allAccounts[0]
    }

    await pca.acquireTokenSilent(silentRequest)
  }
}

export default function generateLogin(publicClientConfig: Configuration, requests: RequestsType[]) {
  return async function login() {
    const pca: PublicClientApplication = new PublicClientApplication(publicClientConfig)

    try {
      // ensure cached valid tokens. Will throw if not logged in
      await acquireTokens(requests, pca)
    } catch (e: any) {
      // can't authenticate to keyvault, don't try to initialize login
      if (
        e?.message?.includes('Azure CLI could not be found.') ||
        e?.message?.includes(
          "Please run 'az login' from a command prompt to authenticate before using this credential."
        )
      ) {
        throw e
      }

      let deviceCodeRequest: DeviceCodeRequest = {
        ...requests[0],
        deviceCodeCallback: response =>
          console.log('device code token', response)
      }
      // Login with device code and fills the cache with first access token
      await pca.acquireTokenByDeviceCode(deviceCodeRequest)

      // get access token for the rest of the scopes
      await acquireTokens(requests.slice(1), pca)
    }

    // return msal cache
    return pca.getTokenCache().getKVStore()
  }
}