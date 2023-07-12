import { LEOClass } from "./options";

const processClasses = (classes: LEOClass[]) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const currentUrl = window.location.href;

  for (const leoClass of classes) {
    if (currentUrl.includes(leoClass.id.toString())) {
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent;
  
        for (const [givenName, preferredName] of Object.entries(leoClass.aliases)) {
          const replaced = text && text.replace(new RegExp(givenName, 'gi'), preferredName);
          if (replaced !== text) {
            node.textContent = replaced;
          }
        }
      }

      // Assumption is that there will only be one matching class per page
      break;
    }
  }
}

const fetchData = async () => {
  let classes: LEOClass[] = [];
  let state = await chrome.storage.sync.get("data");
  if (state.data !== undefined) {
    classes = state.data;
  }
  processClasses(classes);
}

fetchData();

chrome.storage.onChanged.addListener((changes, namespace) => { fetchData(); });