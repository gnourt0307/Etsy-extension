const showAddressBtn = document.getElementById("show_info");
showAddressBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["showAddress.js"],
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["sheetId", "sheetName"], (result) => {
    document.getElementById("sheetIdInput").value = result.sheetId || "";
    document.getElementById("sheetName").value = result.sheetName || "";
  });
});

document.getElementById("write").addEventListener("click", () => {
  const sheetId = document.getElementById("sheetIdInput").value.trim();
  const orderDate = document.getElementById("dateOrder").value.trim();
  const sheetName = document.getElementById("sheetName").value.trim();
  const orderDateFormatted = changeDateFormat(orderDate);
  if (!sheetId || orderDate == "" || !sheetName) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  chrome.storage.local.set({ sheetId, sheetName });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: (sheetId, orderDateFormatted, sheetName) => {
          // Store Sheet ID globally in content script
          window.__SHEET_ID__ = sheetId;
          window.__ORDER_DATE__ = orderDateFormatted;
          window.__SHEET_NAME__ = sheetName;
        },
        args: [sheetId, orderDateFormatted, sheetName],
      },
      () => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        });
      }
    );
  });
});

function changeDateFormat(dateStr) {
  // Split the date string by hyphens
  const [year, month, day] = dateStr.split("-");

  // Return the date in DD/MM/YYYY format
  return `${day}/${month}/${year}`;
}
