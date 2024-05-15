# PDF Signature

## Description

This is a web application for `signing PDF` documents online.  
Users can upload PDF files, sign them online, and download the signed PDF files.  
The application also supports setting PDF passwords, switching between Chinese and English languages, and storing PDF files in the local `IndexedDB`.  
Signatures, text, and images are stored in `localStorage` for reuse.

![image](./public/cover.jpg)

## Features

- Upload PDF files
- Sign PDF files electronically
- Download signed PDF files
- Adjustable signature position and size
- Set PDF passwords
- Open encrypted PDF files
- Support for Chinese and English languages
- Local storage: Store PDF files in IndexedDB
- Signatures, text, and images stored in localStorage

## Development

Clone this repository and install dependencies by running `pnpm`(Node.js version is v20.9.0), then:

- `pnpm dev`: Run in development mode
- `pnpm build`: Build in production mode
- `pnpm preview`: Run preview

## Use Technology

- Frontend: vue3, typescript, tailwindcss, pinia
- Environment construction: vite, eslint, prettier
- PDF Handling: pdfjs-dist, jspdf
- Signature Drawing: fabric.js
- Internationalization: vue-i18n
- Local Storage: idb-keyval

## Usage

1. `Upload PDF File`: Click the upload button to select the PDF file you want to sign. The file will be stored in the local IndexedDB.
2. `Open Encrypted PDF`: If the PDF file is encrypted, you will be prompted to enter the password to open it.
3. `Add Signature`: Choose the position on the PDF where you want to add your signature. Signatures, text, and images will be stored in localStorage for reuse.
4. `Adjust Signature`: Drag and resize the signature as needed.
5. `Set PDF Password`: After completing the signature, you can set a password to open the PDF.
6. `Language Switch`: Click the language switch button on the page to toggle between Chinese and English.
7. `Download Signed PDF`: After signing, click the download button to get the signed PDF file.

## Contribution

Contributions are welcome! If you have any suggestions or improvements, please submit a Pull Request or create an Issue.

## License

This project is licensed under the [MIT](https://opensource.org/licenses/MIT) License - see the [LICENSE]() file for details.
