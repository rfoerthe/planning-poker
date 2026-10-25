// TypeScript 7 (the native compiler) no longer ships the JS compiler API, and
// typescript-eslint 8 peers on typescript <6.1. The project's own `typescript`
// dependency runs tsc 7; the linter packages get the TypeScript 6 API package
// as a private dependency instead of resolving the peer to TypeScript 7.
const TYPESCRIPT_6_API = 'npm:@typescript/typescript6@^6.0.2';

function needsTypeScript6Api(name) {
  return (
    name === 'typescript-eslint' ||
    name === 'ts-api-utils' ||
    name.startsWith('@typescript-eslint/')
  );
}

function readPackage(pkg) {
  if (needsTypeScript6Api(pkg.name) && pkg.peerDependencies?.typescript) {
    delete pkg.peerDependencies.typescript;
    if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: TYPESCRIPT_6_API };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
