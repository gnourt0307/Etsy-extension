//comment out the below line to test the code
async function getInfor() {
  let data = [];
  let elements = document.querySelectorAll(
    ".order-group-list .panel-body-row.has-hover-state"
  );
  const orderDate = window.__ORDER_DATE__;
  elements.forEach((element) => {
    const shirtsPerOrder = element.querySelectorAll(
      "img.rounded.width-75px.height-75px"
    ).length;
    for (let i = 0; i < shirtsPerOrder; i++) {
      //get orderTime
      const orderTime = element.querySelector(
        ".col-md-4.pl-xs-0.hide-xs.hide-sm .text-body-smaller"
      ).innerText;
      const orderTimeFormatted = transformDate(orderTime);
      if (orderTimeFormatted !== orderDate) {
        continue;
      }
      //getlinkId
      const linkId = element.querySelector(
        "div[class*='hide-xs hide-sm'] span a[href*='order_id=']"
      );
      const url = new URL(linkId.href);
      const orderId = url.searchParams.get("order_id");
      //get size, quanity, sku, color, personalization
      let quantity = "";
      let sku = "";
      let size = "";
      let shape_color = "";
      let personalization = "";
      const uls = element.querySelectorAll(
        "ul[class*='list-unstyled text-body-smaller']"
      );
      const containerRight = uls[i].querySelectorAll(
        "li div.float-left span:nth-of-type(2)"
      );
      const containerLeft = uls[i].querySelectorAll(
        "li div.float-left span:nth-of-type(1)"
      );
      const personalizable = element.querySelector(
        ".badge.bg-gray-darker.mr-xs-1.display-inline"
      );
      if (personalizable) {
        for (let i = 0; i < containerLeft.length; i++) {
          if (containerLeft[i].innerText.toLowerCase().includes("size")) {
            size = containerRight[i].innerText;
          }
          if (containerLeft[i].innerText.toLowerCase().includes("quantity")) {
            quantity = containerRight[i].innerText;
          }
          if (containerLeft[i].innerText.toLowerCase().includes("sku")) {
            sku = containerRight[i].innerText;
          }
          if (containerLeft[i].innerText.toLowerCase().includes("color")) {
            shape_color = containerRight[i].innerText;
          }
          if (
            containerLeft[i].innerText.toLowerCase().includes("personalization")
          ) {
            personalization = containerRight[i].innerText;
          }
        }
      } else {
        for (let i = 0; i < containerLeft.length; i++) {
          if (containerLeft[i].innerText.toLowerCase().includes("size")) {
            size = containerRight[i].innerText.match(/[A-Z]+$/)[0];
          }
          if (containerLeft[i].innerText.toLowerCase().includes("quantity")) {
            quantity = containerRight[i].innerText;
          }
          if (containerLeft[i].innerText.toLowerCase().includes("sku")) {
            sku = containerRight[i].innerText;
          }
          if (containerLeft[i].innerText.toLowerCase().includes("color")) {
            shape_color = containerRight[i].innerText;
          }
        }
      }
      const name = element.querySelector(
        "div.address.break-word.fs-mask p span.name"
      ).innerText;
      let street = "";
      const first_address = element.querySelector(
        "div.address.break-word.fs-mask p span.first-line"
      ).innerText;
      const second_address = element.querySelector(
        "div.address.break-word.fs-mask p span.second-line"
      );
      if (second_address) {
        street = first_address + "," + second_address.innerText;
      } else {
        street = first_address;
      }
      const zip = element.querySelector(
        "div.address.break-word.fs-mask p span.zip"
      ).innerText;
      const city = element.querySelector(
        "div.address.break-word.fs-mask p span.city"
      ).innerText;
      let state = "";
      const stateEle = element.querySelector(
        "div.address.break-word.fs-mask p span.state"
      );
      if (stateEle) {
        state = stateEle.innerText;
      }
      const country = element.querySelector(
        "div.address.break-word.fs-mask p span.country-name"
      ).innerText;
      const values = {
        orderTime: orderTimeFormatted,
        orderId: orderId,
        trackingNumber: "",
        blank1: "",
        blank2: "",
        dateReceived: "",
        differeceDate: "",
        carrier: "",
        baseCost: "",
        shippingCost: "",
        total: "",
        productName: "",
        productSKU: "",
        shape_color: shape_color,
        size: size,
        quantity: quantity,
        name: name,
        telephone: "",
        country: country,
        state: state,
        city: city,
        street: street,
        zip: zip,
        sku: sku,
      };
      data.unshift(values);
    }
  });
  console.log("Data from content script:", data);
  return data;
}

function transformDate(input) {
  // Remove the "Ordered " prefix
  let datePart = input.replace("Ordered ", "");

  // Parse the date string
  let date = new Date(datePart);

  // Extract day, month, and year
  let day = String(date.getDate()).padStart(2, "0");
  let month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is 0-indexed
  let year = date.getFullYear();

  // Return in DD/MM/YYYY format
  return `${day}/${month}/${year}`;
}
(function () {
  const sheetId = window.__SHEET_ID__;
  if (!sheetId) {
    console.error("Sheet ID is not defined.");
  } else {
    (async () => {
      const data = await getInfor();
      chrome.runtime.sendMessage(
        { action: "writeToSheet", data: data, sheetId: sheetId },
        (response) => {
          console.log("Response from background:", response.message);
        }
      );
    })();
  }
})();
