# Changelog

## [0.4.1](https://github.com/tzuyi0817/PDF-signature/compare/v0.4.0...v0.4.1) (2025-04-05)

### Refactors

- refactors CSS framework to `tailwindcss` v4

## [0.4.0](https://github.com/tzuyi0817/PDF-signature/compare/v0.3.5...v0.4.0) (2024-09-20)

### Features

- batch archive, delete and reduction files

### Refactors

- preload plugin ([2de6cd5](https://github.com/tzuyi0817/PDF-signature/commit/2de6cd50be81893812d2457e968494c22a40f8f4))

## [0.3.5](https://github.com/tzuyi0817/PDF-signature/compare/v0.3.4...v0.3.5) (2024-09-16)

### Features

- preload font ([eaa0922](https://github.com/tzuyi0817/PDF-signature/commit/eaa092243a1c55b4b733e5b823e8fe313a8a81af))
- loading screen ([0c092ed](https://github.com/tzuyi0817/PDF-signature/commit/0c092edf5300dd8cdfb6aff8309f49b7a4681513))

### Refactors

- optimize language popup interactive experience ([f8ada89](https://github.com/tzuyi0817/PDF-signature/commit/f8ada89a372422a7e5b673db48fa424846ce9535))
- global error handling ([2e400d6](https://github.com/tzuyi0817/PDF-signature/commit/2e400d610e2ac2884738c4d52821f67b20f5e716))

## [0.3.4](https://github.com/tzuyi0817/PDF-signature/compare/v0.3.3...v0.3.4) (2024-08-28)

### Refactors

- compress base64 image change to use browser-image-compression ([15b8921](https://github.com/tzuyi0817/PDF-signature/commit/15b8921e30ccaa688d67628a565ff32074598cbd))

## [0.3.3](https://github.com/tzuyi0817/PDF-signature/compare/v0.3.2...v0.3.3) (2024-08-22)

### Bug Fixes

- click on the popup make to close encryption popup ([3dbe776](https://github.com/tzuyi0817/PDF-signature/commit/3dbe7766f64e53c293ecaa4393894d2376b5f549))

## [0.3.2](https://github.com/tzuyi0817/PDF-signature/compare/v0.3.1...v0.3.2) (2024-07-08)

### Refactors

- use own component package combining `fabric` and `pdfjs-dist` ([@component-hook/pdf-canvas](https://www.npmjs.com/package/@component-hook/pdf-canvas))

## [0.3.1](https://github.com/tzuyi0817/PDF-signature/compare/v0.3.0...v0.3.1) (2024-06-17)

### Features

- custom text placed can be edited ([#22](https://github.com/tzuyi0817/PDF-signature/issues/22)) ([15039fb](https://github.com/tzuyi0817/PDF-signature/commit/15039fb2a4e67d5c784823feed18dab122a1bf3d))
- edit signed PDF ([1391470](https://github.com/tzuyi0817/PDF-signature/commit/1391470e7ba5c7404f5167665f8d3bc0baa546a4))

### Bug Fixes

- sign icon hover ([1ceebef](https://github.com/tzuyi0817/PDF-signature/commit/1ceebef160b2210647bee300f07aa3f59e5e93c8))
- catch global error ([c15cd7d](https://github.com/tzuyi0817/PDF-signature/commit/c15cd7dcdc5370f1678671cd1dcf6077b0ca371d))

## [0.3.0](https://github.com/tzuyi0817/PDF-signature/compare/v0.2.0...v0.3.0) (2024-05-21)

### Features

- support more languages

## [0.2.0](https://github.com/tzuyi0817/PDF-signature/compare/v0.1.0...v0.2.0) (2024-05-15)

### Features

- can open encrypted PDF files
- when download can set PDF passwords

### Bug Fixes

- step progress not shown problem
- #app scroll overflow hidden

### Other Changes

- eslint upgrade to flat pattern
- add MIT LICENSE

## [0.1.0](https://github.com/tzuyi0817/PDF-signature/compare/47fb312de1f7f8e54a0cb4cfad284e5879b61066...v0.1.0) (2024-04-12)

### Features

- complete basic PDF signature functions
- PDF file will be stored in the indexedDB on the local side
- change page transition
- support english and chinese language
- signature files and images are stored in localStorage
