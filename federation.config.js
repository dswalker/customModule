const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'custom-module',



  exposes: {
    './Component': './src/app/app.component.ts',
  },

  shared: {
    "@angular/core": { requiredVersion: "auto" },
    "@angular/common": { requiredVersion: "auto" },
    "@angular/router": { requiredVersion: "auto" },
    "rxjs": { requiredVersion: "auto" },
    "@angular/common/http": { requiredVersion: "auto" },
    '@angular/platform-browser': { requiredVersion: 'auto' },
    '@ngx-translate/core': { singleton: true},
    '@ngrx/store': { singleton: true},
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // New feature for more performance and avoiding
    // issues with node libs. Comment this out to
    // get the traditional behavior:
    ignoreUnusedDeps: true
  }
});
