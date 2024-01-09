# PDF Signature

## Description

This is an online instant `PDF signature` website.  
The signed pdf file will be stored in the `local storage` on the local side.

## Development

Clone this repository and install dependencies by running `pnpm`(Node.js version is v20.9.0), then:

- `pnpm dev`: Run in development mode
- `pnpm build`: Build in production mode
- `pnpm preview`: Run preview

## Project Files

```text
src/
├── assets/
│   ├── contract/*
│   ├── font/*
│   ├── icon/*
│   ├── img/*
│   └── logo/*
├── components/
│   ├── complete/
│   │   └── CompleteContent.vue
│   ├── index/
│   │   ├── IndexArchives.vue
│   │   ├── IndexContent.vue
│   │   ├── IndexFiles.vue
│   │   ├── IndexMenu.vue
│   │   └── IndexTrash.vue
│   ├── signature/
│   │   ├── SignatureCanvasItem.vue
│   │   ├── SignatureContent.vue
│   │   ├── SignatureDrawPopup.vue
│   │   ├── SignatureImage.vue
│   │   ├── SignatureLiteral.vue
│   │   ├── SignatureMask.vue
│   │   ├── SignaturePage.vue
│   │   ├── SignaturePopup.vue
│   │   └── SignatureSign.vue
│   ├── upload/
│   │   └── UploadContent.vue
│   ├── SignFile.vue
│   ├── SignFiles.vue
│   ├── SignFooter.vue
│   ├── SignHeader.vue
│   ├── SignIcon.vue
│   ├── SignPopup.vue
│   ├── SignStep.vue
│   ├── SignStepBtn.vue
│   └── SignToast.vue
└── hooks/
│   ├── useFabric.ts
│   ├── useRedirect.ts
│   └── useWarnPopup.vue
└── pages/
│   ├── Complete.vue
│   ├── Index.vue
│   ├── Signature.vue
│   └── Upload.vue
└── router/
│   └── index.ts
└── store/
│   ├── image.ts
│   ├── index.ts
│   ├── literal.ts
│   ├── pdf.ts
│   └── signature.ts
└── style/
│   ├── common/
|   │   ├── all.css
│   │   ├── button.css
│   │   ├── content.css
│   │   ├── iconScale.css
│   │   ├── input.css
│   │   ├── layout.css
│   │   ├── mask.css
│   │   ├── scrollbar.css
|   │   └── text.css
│   ├── index.css
│   └── tailwind.css
└── types/
│   ├── menu.d.ts
│   └── pdf.d.ts
└── utils/
│   ├── checkType.ts
│   ├── common.ts
│   ├── image.ts
│   ├── jspdf.ts
│   ├── pdfJs.ts
│   └── toast.ts
├── App.vue
├── global.d.ts
├── vite-env.d.ts
└── main.ts
```

## Use Technology

- vue3
- typescript
- tailwindcss
- vite
- pina
- pinia-plugin-persistedstate
- vue-router
- vue-i18n
- pdfjs
- fabric
- jspdf
