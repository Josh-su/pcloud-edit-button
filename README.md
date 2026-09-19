# pCloud pDocs Direct Editor

A lightweight Chrome Extension that adds an **"Éditer"** / **"Éditer dans pDocs"** button directly to pCloud Web for Office files (`.docx`, `.xlsx`, `.pptx`).

## The Problem
On pCloud Web, when collaborating inside a shared folder owned by a paid subscriber, users can create new documents using `+ Ajouter -> Document`. However, once the initial editor tab is closed, pCloud's UI only offers a static PDF preview ("Aperçu") with no way to reopen the online editor.

## The Solution
This extension hooks into pCloud's internal `docsrv/getdocumentcode` API to inject seamless, native-styled edit buttons into:
- The top file action toolbar
- The 3-dot row context menu

## Installation (Manual)
1. Download or clone this repository.
2. In Google Chrome (or Brave / Edge), navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** (*Charger l'extension non empaquetée*) and select this folder.
5. Open [my.pcloud.com](https://my.pcloud.com) and select any document!

## License
MIT