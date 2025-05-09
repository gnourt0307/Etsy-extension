(function () {
  const trackingSection = document.querySelectorAll(
    "div.col-md-4.pl-xs-0.hide-xs.hide-sm"
  );

  for (let button of trackingSection) {
    let Button = button.querySelector(
      "span.etsy-icon.icon-smaller.text-gray-lightest"
    );
    if (Button) {
      Button.click();
    }
  }

  console.log("Button clicked!");
})();
