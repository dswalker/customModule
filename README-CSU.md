# CSU Primo NDE Central Package

This repository is the working source for the CSU consortium's Primo New
Discovery Experience (NDE) Central Package. It is based on Ex Libris's
[`customModule`](https://github.com/ExLibrisGroup/customModule) project.

## Package identity

The build is configured in `build-settings.env` as:

```env
INST_ID=01CALS_NETWORK
VIEW_ID=CENTRAL_PACKAGE
```

Consequently, `npm run build` creates:

- `dist/01CALS_NETWORK-CENTRAL_PACKAGE/`
- `dist/01CALS_NETWORK-CENTRAL_PACKAGE.zip`

The ZIP contains `01CALS_NETWORK-CENTRAL_PACKAGE` as its root directory, as
required by Alma.

## Initial setup

Use Node.js 20 (the version is recorded in `.nvmrc`), then install the locked
dependencies. Node.js 20 is installed on this workstation with Homebrew:

```sh
node --version
npm ci
```

If using `nvm` on another workstation, run `nvm use` first.

## Customize and build

- Put static NDE assets under `src/assets/`. The included folders document the
  expected logo, icon, homepage, header/footer, CSS, and JavaScript locations.
- Put Angular components under `src/app/` and register them in
  `src/app/custom1-module/customComponentMappings.ts`.
- Run `npm run build` to compile and package the uploadable ZIP.

Do not add `ADDON_NAME` to `build-settings.env`. That setting converts this
project into a separately hosted NDE add-on; an Alma-managed Central Package
uses `INST_ID` plus `VIEW_ID=CENTRAL_PACKAGE` instead.

## Local preview

1. Set a consortium member's NDE base URL in `proxy/proxy.const.mjs`.
2. Run `npm run build` at least once.
3. Run `npm run start:proxy`.
4. Open the local URL with that member's NDE view ID, for example:

   `http://localhost:4201/nde/home?vid=MEMBER_INST:VIEW_CODE&lang=en`

The proxy deliberately leaves the remotely deployed Network Zone central
manifest alone and substitutes the local package for the member view. This is
the behavior implemented by the upstream Ex Libris development scaffold.

## Deploy in Alma

1. Switch Alma configuration to the `01CALS_NETWORK` Network Zone.
2. Go to **Configuration > Discovery > Display Configuration > Manage
   Customization Package**.
3. In **NDE Central Package**, upload
   `dist/01CALS_NETWORK-CENTRAL_PACKAGE.zip`.
4. Select **Upload**, then **Save**.

Member institutions control whether they inherit the central package. A local
view package can override inherited central assets and styles.

If an NDE Central Package is already deployed, download and preserve it before
the first upload from this repository so existing consortium customizations are
not lost.

The upstream demonstration images and JavaScript console message have been
removed from the deployable assets. The first build is therefore neutral and
should be treated as a development baseline, not as a replacement for any
package already deployed in Alma.
