// --- CONFIG & HELPERS ---
const SUPPORTED_EXTENSIONS = ['.docx', '.xlsx', '.pptx', '.doc', '.xls', '.ppt', '.odt', '.ods', '.odp'];

function isSupportedDoc(filename) {
  if (!filename) return false;
  return SUPPORTED_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext));
}

function getAuthToken() {
  if (typeof globalUser !== 'undefined' && globalUser?.auth) return globalUser.auth;
  if (window.globalUser?.auth) return window.globalUser.auth;
  try {
    const match = document.cookie.match(/(?:^|;\s*)auth=([^;]+)/);
    if (match) return match[1];
  } catch (e) {}
  return localStorage.getItem("auth") || sessionStorage.getItem("auth") || "";
}

function getSelectedFileInfo() {
  const selectedRow = document.querySelector('tr.selected, .selected, [class*="selected"], [aria-selected="true"]');
  if (!selectedRow) return null;

  const nameElem = selectedRow.querySelector('[title], .name, [class*="name"], span, a');
  const filename = nameElem?.getAttribute('title') || nameElem?.textContent || '';

  const rawId = selectedRow.getAttribute('data-id') || 
                selectedRow.getAttribute('data-fileid') ||
                selectedRow.querySelector('[data-id]')?.getAttribute('data-id') || '';
  
  const fileId = rawId.replace(/\D/g, '');
  return { fileId, filename };
}

async function openPDocs(fileId) {
  const auth = getAuthToken();
  if (!auth) {
    alert("Could not retrieve session auth. Please refresh the page.");
    return;
  }

  const apiHost = "https://eapizrh1.pcloud.com";

  try {
    const res = await fetch(`${apiHost}/docsrv/getdocumentcode?fileid=${fileId}&auth=${auth}`);
    const data = await res.json();
    const link = data.pdocslink || data.link;

    if (link) {
      const url = new URL(link);
      url.searchParams.append("forcemode", "edit");
      window.open(url.href, "_blank");
    } else if (data.error === "Access denied") {
      alert("pDocs web editing is restricted to paid accounts or files inside shared folders owned by a paid user.");
    } else {
      alert("Unable to open in pDocs: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("pDocs request error:", err);
  }
}

function configureItem(element, labelText) {
  const labelElem = element.querySelector('[class*="MenuLabel"], [class*="label"], .label') || element;
  if (labelElem !== element) {
    labelElem.textContent = labelText;
  }
  const icon = element.querySelector('i');
  if (icon) {
    icon.className = 'smallIcon lightColorIcon fa-light fa-pen';
  }
}

// --- UI INJECTION ---
function updateUI() {
  const fileInfo = getSelectedFileInfo();

  if (!fileInfo || !isSupportedDoc(fileInfo.filename)) {
    document.querySelectorAll('#pdocs-top-btn, #pdocs-menu-item').forEach(el => el.remove());
    return;
  }

  // 1. Top Action Bar Button
  const allButtons = Array.from(document.querySelectorAll('button, div, span, a'));
  const topApercuBtn = allButtons.find(el => el.textContent.trim().startsWith('Aper') && !el.id.includes('pdocs') && el.offsetParent !== null && !el.closest('[role="menu"], ul, .szh-menu'));
  const topRenommerBtn = allButtons.find(el => el.textContent.trim().startsWith('Renomm') && !el.id.includes('pdocs') && el.offsetParent !== null && !el.closest('[role="menu"], ul, .szh-menu'));
  const topAnchor = topApercuBtn || topRenommerBtn;

  if (topAnchor && !document.getElementById('pdocs-top-btn')) {
    const editBtn = topAnchor.cloneNode(true);
    editBtn.id = 'pdocs-top-btn';
    configureItem(editBtn, 'Éditer');

    editBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const current = getSelectedFileInfo();
      if (current?.fileId) openPDocs(current.fileId);
    };

    topAnchor.insertAdjacentElement('afterend', editBtn);
  }

  // 2. Dropdown / Context Menu
  const menuApercuItems = Array.from(document.querySelectorAll('li, [role="menuitem"], .szh-menu__item'))
    .filter(el => el.textContent.trim().startsWith('Aperçu') && !el.id.includes('pdocs') && el.offsetParent !== null);

  menuApercuItems.forEach(apercuItem => {
    const menuContainer = apercuItem.parentElement;
    if (menuContainer && !menuContainer.querySelector('#pdocs-menu-item')) {
      const editMenuItem = apercuItem.cloneNode(true);
      editMenuItem.id = 'pdocs-menu-item';
      configureItem(editMenuItem, 'Éditer dans pDocs');

      editMenuItem.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const current = getSelectedFileInfo();
        if (current?.fileId) openPDocs(current.fileId);
      };

      apercuItem.insertAdjacentElement('afterend', editMenuItem);
    }
  });
}

const observer = new MutationObserver(updateUI);
observer.observe(document.body, { childList: true, subtree: true, attributes: true });
window.addEventListener('resize', updateUI);