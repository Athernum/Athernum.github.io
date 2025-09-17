// Function to fetch language data
async function fetchData(lang) {
  const response = await fetch(`content/${lang}.json`);
  return response.json();
}

// Function to set the language preference
function setLanguagePreference(lang) {
  localStorage.setItem("language", lang);
  location.reload();
}

// Function to update content based on selected language
function updateContentElement(langData, element) {
  const key = element.getAttribute("data-i18n");

    if (element.tagName === "INPUT" && key === "placeholder_text") {
      // If the element is an input with placeholder_text attribute, set placeholder
      element.placeholder = langData[key];
    } else {
      // For other elements, set text content
      //element.textContent = langData[key];
      element.innerHTML = langData[key];
    }
}
function updateContent(langData) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    updateContentElement(langData, element);
  });
}

// Function to change language
async function changeLanguage(lang) {
  await setLanguagePreference(lang);

  const langData = await fetchData(lang);
  updateContent(langData);
}

function updateAutoProperty(dataBlob, element) {
  const key = element.getAttribute("auto-property");
  if(key === "content") {
    element.innerHTML = dataBlob[key];
  }
  else {
    element.setAttribute(key, dataBlob[key]);
  }
}

async function loadDynamic(langData) {
  const anchorElements = document.querySelectorAll("[data-auto]");
  for(const anchor of anchorElements) {
    const properties = anchor.getAttribute("data-auto").split(" ");
    const len = properties.length;
    if(len != 0) {
       const dynamicData = await fetchData(properties[0]);
       for(const dataBlob of dynamicData) {
         const template = document.getElementById(len > 1 ? properties[1] : "default");
         if(template != null && template.content.firstElementChild != null) {
           const container = document.importNode(template.content.firstElementChild, true);
         
           container.querySelectorAll("[auto-property]").forEach((element) => {
            updateAutoProperty(dataBlob, element);
           });
           container.querySelectorAll("[data-i18n]").forEach((element) => {
            updateContentElement(langData, element);
           });
    
           anchor.appendChild(container); 
       }}
    }
  }
}

// Detect browser language
function getBrowserLanguage() {
  const userLang = navigator.language || navigator.userLanguage; 
  switch(userLang.slice(0,2)) {
    case "de": return "de";
    default: return "en";
  }
}

// Call updateContent() on page load
window.addEventListener("DOMContentLoaded", async () => {
  const userPreferredLanguage = localStorage.getItem("language") || getBrowserLanguage();
  const langData = await fetchData(userPreferredLanguage);
  updateContent(langData);
  loadDynamic(langData);
});