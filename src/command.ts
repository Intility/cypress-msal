/// <reference types="cypress" />

import { CacheKVStore } from "@azure/msal-node"

Cypress.Commands.add('login', () => {
  return cy.task<CacheKVStore>('login').then(response => {
    Object.entries(response).forEach(([key, value]) => {
      let cacheKey = key
      // msal-node internal cache ends the keys with double dash
      // msal-browser does not, so we need to remove them
      if (cacheKey.endsWith('--')) {
        cacheKey = cacheKey.replace('--', '')
      }
      sessionStorage.setItem(cacheKey, JSON.stringify(value))
    })
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in using msal test user
       * @example cy.login()
       */
      login(): Chainable<any>
    }
  }
}