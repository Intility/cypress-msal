<h1 align="center">
  <img src="https://avatars.githubusercontent.com/u/35199565" width="124px"/><br/>
  @intility/cypress-msal
</h1>

<p align="center">
  A cypress plugin for projects using @azure/msal-browser. 
</p>

<p align="center">
  <a href="https://github.com/Intility/cypress-msal/actions">
    <img alt="pipeline" src="https://github.com/Intility/cypress-msal/actions/workflows/publish.yml/badge.svg" style="max-width:100%;" />
  </a>
  <a href="https://www.npmjs.com/package/@intility/cypress-msal">
    <img alt="package version" src="https://img.shields.io/npm/v/@intility/cypress-msal?label=%40intility%2Fcypress-msal" style="max-width:100%;" />
  </a>
</p>

## Installation

```
npm install @intility/cypress-msal
```

## Usage

Register the package in `support/e2e.js`:

```js
import "@intility/cypress-msal/command";
```

Configure the login command, and add it as a task in `cypress.config.js`:

```js
import { defineConfig } from "cypress"
import generateLogin from "@intility/cypress-msal"

let publicClientConfig = {
  auth: {
    clientId: "APP_CLIENT_ID",
    authority: "https://login.microsoftonline.com/TENANT_ID",
  },
};

let requests = [
  {
    scopes: ["User.Read"],
  },
];

let login = generateLogin(publicClientConfig, requests);

export default defineConfig({
  // ...other cypress settings here...
  e2e: {
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      on("task", {
        // register a task named login which calls the generated login from @intility/cypress-msal
        login,
      });
    }
  }
})
```

You can now login by using the `login` command before running your tests.

```js
before(() => cy.login());
```

## Azure Configuration

The App registration needs to be a Public Application to be able to use the Device Code flow.

## `generateLogin`

### Syntax

```js
let login = generateLogin(publicClientConfiguration, requests);
```

### Parameters

#### `publicClientConfiguration`

A [`Configuration`](https://azuread.github.io/microsoft-authentication-library-for-js/ref/modules/_azure_msal_node.html#configuration) that will be used to initialize a [`PublicClientApplication`](https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_node.publicclientapplication.html) from `@azure/msal-node`.

#### `requests`

An array of Requests (`{ scopes: string[] }`) that will be used for [`acquireTokenByDeviceCode`](https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_node.publicclientapplication.html#acquiretokenbydevicecode) and [`acquireTokenSilent`](https://azuread.github.io/microsoft-authentication-library-for-js/ref/classes/_azure_msal_node.publicclientapplication.html#acquiretokensilent).

### Return value

A task plugin named `login` that should be registered with `on("task", { login })`.

## `cy.login`

### Syntax

`cy.login()`

### Return value

A Promise that get resolves when all tokens are acquired and registered in `sessionStorage` to be used by `@azure/msal-browser`.
