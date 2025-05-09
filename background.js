const clientId =
  "504683960530-17rj9kft7n1lio9uellktl09if4cvt4m.apps.googleusercontent.com"; // Web Client ID
const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;
const scopes = "https://www.googleapis.com/auth/spreadsheets";

function getAccessToken(callback) {
  const authUrl =
    `https://accounts.google.com/o/oauth2/auth` +
    `?client_id=${clientId}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&prompt=consent`;

  chrome.identity.launchWebAuthFlow(
    { url: authUrl, interactive: true },
    function (redirectUrl) {
      if (chrome.runtime.lastError || !redirectUrl) {
        console.error("Auth flow error:", chrome.runtime.lastError?.message);
        return;
      }

      const params = new URLSearchParams(redirectUrl.split("#")[1]);
      const accessToken = params.get("access_token");
      callback(accessToken);
    }
  );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "writeToSheet") {
    const data = request.data;
    const sheetId = request.sheetId;
    const values = data.map((infor) => [
      infor.orderTime,
      infor.orderId,
      infor.trackingNumber,
      infor.blank1,
      infor.blank2,
      infor.dateReceived,
      infor.differeceDate,
      infor.carrier,
      infor.baseCost,
      infor.shippingCost,
      infor.total,
      infor.productName,
      infor.productSKU,
      infor.shape_color,
      infor.size,
      infor.quantity,
      infor.name,
      infor.telephone,
      infor.country,
      infor.state,
      infor.city,
      infor.street,
      infor.zip,
      infor.sku,
    ]);
    console.log("Data received in background:", values);
    sendResponse({ message: "Writing to Google Sheets..." });

    getAccessToken(async (token) => {
      const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?majorDimension=ROWS`;

      let lastRowIndex = 0;
      await fetch(readUrl, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const rows = data.values || [];

          // Find the last row with any non-empty cell
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].some((cell) => cell !== "")) {
              lastRowIndex = i + 1; // +1 because Sheets is 1-indexed
            }
          }
        });
      const nextRow = lastRowIndex + 1;
      console.log("Next row to write:", nextRow);
      const writeRange = `Sheet1!A${nextRow}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${writeRange}:append?valueInputOption=USER_ENTERED`;

      fetch(url, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.error("Fetch error:", err));
    });
  }
});
