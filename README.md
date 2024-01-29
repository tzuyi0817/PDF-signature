# PDF Signature

## Description

This is an online instant `PDF signature` website.  
The signed pdf file will be stored in the `indexedDB` on the local side.

![image](./public/cover.jpg)

## Development

Clone this repository and install dependencies by running `pnpm`(Node.js version is v20.9.0), then:

- `pnpm dev`: Run in development mode
- `pnpm build`: Build in production mode
- `pnpm preview`: Run preview

## Project Files

```text
src/
├── assets/
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
│   │   ├── SignatureLoading.vue
│   │   ├── SignatureMagnifier.vue
│   │   ├── SignatureMask.vue
│   │   ├── SignatureMergePopup.vue
│   │   ├── SignaturePage.vue
│   │   ├── SignaturePageItem.vue
│   │   ├── SignaturePopup.vue
│   │   ├── SignatureSign.vue
│   │   └── SignatureToolbar.vue
│   ├── upload/
│   │   └── UploadContent.vue
│   ├── SignFile.vue
│   ├── SignFiles.vue
│   ├── SignFooter.vue
│   ├── SignHeader.vue
│   ├── SignIcon.vue
│   ├── SignLoading.vue
│   ├── SignPopup.vue
│   ├── SignStep.vue
│   ├── SignStepBtn.vue
│   └── SignToast.vue
├── configs/
│   ├── common.config.ts
│   └── idb.config.ts
├── hooks/
│   ├── useFabric.ts
│   ├── useRedirect.ts
│   ├── useResize.ts
│   └── useWarnPopup.vue
├── locales/
│   ├── en-US.json
│   └── zh-TW.json
├── pages/
│   ├── CompletePage.vue
│   ├── IndexPage.vue
│   ├── SignaturePage.vue
│   └── UploadPage.vue
├── plugins/
│   ├── i18n.ts
│   └── idb.ts
├── router/
│   └── index.ts
├── store/
│   ├── config.ts
│   ├── image.ts
│   ├── index.ts
│   ├── literal.ts
│   ├── pdf.ts
│   └── signature.ts
├── style/
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
│   ├── signature.css
│   └── tailwind.css
├── types/
│   ├── fabric.d.ts
│   ├── menu.d.ts
│   └── pdf.d.ts
├── utils/
│   ├── checkType.ts
│   ├── common.ts
│   ├── idb.ts
│   ├── image.ts
│   ├── jspdf.ts
│   ├── pdfJs.ts
│   ├── reader.ts
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
- idb-keyval
