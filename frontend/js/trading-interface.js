/**
 * Trading Interface
 * A modular implementation of a trading platform interface
 */

/**
 * Initialize trading action tabs (Buy/Sell)
 * @returns {void}
 */
function initTradingTabs() {
  const tradingTabs = document.querySelectorAll(".trading-tab");

  tradingTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      tradingTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Update button text only, not directly setting styles
      const placeOrderButton = document.querySelector(".place-order-button");
      if (placeOrderButton) {
        // Set button text based on action type
        placeOrderButton.textContent =
          this.dataset.action === "buy"
            ? "Place Buy Order"
            : "Place Sell Order";

        // Remove all possible action classes
        placeOrderButton.classList.remove("buy-action", "sell-action");

        // Add class for current action
        placeOrderButton.classList.add(`${this.dataset.action}-action`);
      }

      // Update body data attribute for CSS usage
      document.body.setAttribute("data-trading-action", this.dataset.action);
    });
  });
}

/**
 * Initialize trading type options (Stocks/Global/Futures)
 * @returns {void}
 */
function initTypeOptions() {
  const typeOptions = document.querySelectorAll(".type-option");

  typeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      typeOptions.forEach((o) => o.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

/**
 * Initialize price input controls with increment/decrement buttons
 * @returns {void}
 */
function initPriceControls() {
  const priceInput = document.getElementById("tradePrice");
  const decreaseBtn = document.querySelector(".decrease");
  const increaseBtn = document.querySelector(".increase");

  // Set initial price from stock data if available
  const currentPriceEl = document.getElementById("currentPrice");
  if (currentPriceEl) {
    const currentPrice = parseFloat(
      currentPriceEl.textContent.replace("$", "")
    );
    if (!isNaN(currentPrice)) {
      priceInput.value = currentPrice.toFixed(2);
    }
  }

  decreaseBtn.addEventListener("click", function () {
    let currentValue = parseFloat(priceInput.value);
    if (!isNaN(currentValue)) {
      priceInput.value = (currentValue - 0.01).toFixed(2);
      updateTradingSummary();
    }
  });

  increaseBtn.addEventListener("click", function () {
    let currentValue = parseFloat(priceInput.value);
    if (!isNaN(currentValue)) {
      priceInput.value = (currentValue + 0.01).toFixed(2);
      updateTradingSummary();
    }
  });

  // Update trading summary when price input changes
  priceInput.addEventListener("input", updateTradingSummary);
}

/**
 * Calculate positions of slider options
 * @returns {Array} Array of position data for each option
 */
function calculateOptionPositions() {
  const sliderOptions = document.querySelectorAll(".slider-option");
  const sliderTrack = document.querySelector(".trading-slider-track");
  const positions = [];

  if (sliderTrack && sliderOptions.length > 0) {
    const trackRect = sliderTrack.getBoundingClientRect();
    const trackLeft = trackRect.left;
    const trackWidth = trackRect.width;

    sliderOptions.forEach((option, index) => {
      const optionRect = option.getBoundingClientRect();
      const optionCenter = optionRect.left + optionRect.width / 2 - trackLeft;
      const percentage = (optionCenter / trackWidth) * 100;

      positions.push({
        index: index,
        position: percentage,
        width: (optionRect.width / trackWidth) * 100,
        value: parseInt(option.dataset.value || index * 20), // Default 20% increment
      });
    });
  }

  return positions;
}

/**
 * Update progress bar width based on selected option
 * @param {number} selectedIndex - Index of selected slider option
 * @returns {void}
 */
function updateProgressWidth(selectedIndex) {
  const sliderProgress = document.querySelector(".slider-progress");
  const sliderTrack = document.querySelector(".trading-slider-track");

  if (!sliderProgress || !sliderTrack) return;

  const positions = calculateOptionPositions();
  if (positions.length === 0) return;

  const selectedPosition = positions[selectedIndex];
  if (!selectedPosition) return;

  // Update: Calculate progress width to the right edge of the selected option, not the center
  let progressWidth = 0;

  if (selectedIndex === positions.length - 1) {
    // If it's the last option, fill to 100%
    sliderProgress.style.width = "calc(100% - 8px)";
  } else {
    // Calculate the right edge position of the current option
    // Right edge = center position + half of option width
    progressWidth = selectedPosition.position + selectedPosition.width / 2;

    // Ensure it doesn't exceed 100%
    progressWidth = Math.min(progressWidth, 100);
    sliderProgress.style.width = `${progressWidth}%`;
  }

  console.log(
    `updateprogresswidth: ${progressWidth}%, activeoption: ${selectedPosition.value}%`
  );
}

/**
 * Initialize slider functionality for trading amounts
 * @returns {void}
 */
function initSlider() {
  const sliderOptions = document.querySelectorAll(".slider-option");
  const quantityInput = document.getElementById("tradeQuantity");

  // Set event listeners for slider options
  sliderOptions.forEach((option, index) => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Remove all active classes
      sliderOptions.forEach((o) => o.classList.remove("active"));

      // Add active class to current option
      this.classList.add("active");

      // Get percentage value
      const percentage = parseInt(this.dataset.value || index * 10 + 10); // Default 10% increment

      // Update progress bar width
      updateProgressWidth(index);

      // Calculate quantity based on percentage
      const maxQuantity = 10000000; // User's available funds
      quantityInput.value = ((maxQuantity * percentage) / 100).toFixed(2);
      updateTradingSummary();

      console.log(`Selected ${percentage}% option, index: ${index}`);
    });
  });

  // Initialize with default option
  const defaultOptionIndex = 1; // Second option, corresponding to 25%
  if (sliderOptions[defaultOptionIndex]) {
    sliderOptions[defaultOptionIndex].click();
  }

  // Update trading summary when quantity input changes
  quantityInput.addEventListener("input", updateTradingSummary);

  // Handle window resize events
  window.addEventListener("resize", function () {
    const activeIndex = Array.from(sliderOptions).findIndex((option) =>
      option.classList.contains("active")
    );
    if (activeIndex >= 0) {
      updateProgressWidth(activeIndex);
    }
  });
}

/**
 * Initialize max button functionality
 * @returns {void}
 */
function initMaxButton() {
  const maxButton = document.querySelector(".max-button");
  const quantityInput = document.getElementById("tradeQuantity");
  const sliderOptions = document.querySelectorAll(".slider-option");

  if (maxButton) {
    maxButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Set maximum quantity
      quantityInput.value = 10000000; // Maximum available quantity

      // Activate the last option
      sliderOptions.forEach((o) => o.classList.remove("active"));
      const lastOption = sliderOptions[sliderOptions.length - 1];
      if (lastOption) {
        lastOption.classList.add("active");
        updateProgressWidth(sliderOptions.length - 1);
      }

      updateTradingSummary();
    });
  }
}

/**
 * Initialize place order button functionality
 * @returns {void}
 */
function initPlaceOrderButton() {
  const placeOrderButton = document.querySelector(".place-order-button");
  const priceInput = document.getElementById("tradePrice");
  const quantityInput = document.getElementById("tradeQuantity");

  placeOrderButton.addEventListener("click", function () {
    const action = document.querySelector(".trading-tab.active").dataset.action;
    const price = parseFloat(priceInput.value);
    const quantity = parseFloat(quantityInput.value);

    if (isNaN(price) || isNaN(quantity)) {
      alert("Please enter valid price and quantity");
      return;
    }

    // This would typically call an API to place the order
    alert(
      `${action.toUpperCase()} order placed: ${quantity} shares at $${price}`
    );
  });
}

/**
 * Update trading summary based on price and quantity
 * @returns {void}
 */
function updateTradingSummary() {
  const priceInput = document.getElementById("tradePrice");
  const quantityInput = document.getElementById("tradeQuantity");
  const price = parseFloat(priceInput.value);
  const quantity = parseFloat(quantityInput.value);

  if (!isNaN(price) && !isNaN(quantity)) {
    const cost = price * quantity;
    document.querySelector(".summary-value").textContent =
      cost.toFixed(2) + " USDT";
  }
}

/**
 * Initialize the trading interface with all necessary components
 * @returns {void}
 */
function initTradingInterface() {
  initTradingTabs();
  initTypeOptions();
  initPriceControls();
  initSlider();
  initMaxButton();
  initPlaceOrderButton();

  // Initialize with defaults
  updateTradingSummary();
}

/**
 * Initialize the responsive trading interface
 * @returns {void}
 */
function setupResponsiveTrading() {
  // Get relevant elements
  const tradingSection = document.querySelector(".trading-interface-section");
  const tradingHeader = tradingSection
    ? tradingSection.querySelector(".section-header")
    : null;
  const autoTradeBtn = document.querySelector(".action-btn.buy-btn");

  // Exit if necessary elements not found
  if (!tradingSection || !tradingHeader) return;

  // Create content container for all non-header content
  const sectionContent = document.createElement("div");
  sectionContent.className = "section-content";

  // Move all non-header content to new container
  while (tradingSection.children.length > 1) {
    sectionContent.appendChild(tradingSection.children[1]);
  }

  tradingSection.appendChild(sectionContent);

  // Create collapse/expand indicator
  const collapseIndicator = document.createElement("i");
  collapseIndicator.className = "fas fa-chevron-up trading-collapse-indicator";

  // Add indicator to title area
  const titleElement = tradingHeader.querySelector(".section-title");
  if (titleElement) {
    titleElement.appendChild(collapseIndicator);
  }

  // Add badge
  const tradeBadge = document.createElement("div");
  tradeBadge.className = "trade-badge";
  tradeBadge.textContent = "SPOT";
  tradingHeader.appendChild(tradeBadge);

  // Toggle expansion state when header is clicked
  tradingHeader.addEventListener("click", function () {
    toggleTradingExpand();
  });

  // Auto-trade button click event
  if (autoTradeBtn) {
    autoTradeBtn.addEventListener("click", function () {
      // Ensure trading area is expanded
      if (!tradingSection.classList.contains("expanded")) {
        toggleTradingExpand();
      }
    });
  }

  // Handle window resize events
  window.addEventListener("resize", function () {
    const isHighRes = window.innerWidth >= 2560 || window.innerHeight >= 1440;

    // Remove collapsible behavior on high-resolution screens
    if (isHighRes) {
      tradingSection.classList.remove("expanded");
      tradingSection.style.transform = "none";
    } else {
      // Restore collapsible behavior on low-resolution screens
      if (!tradingSection.classList.contains("expanded")) {
        tradingSection.style.transform = "translateY(calc(100% - 60px))";
      }
    }
  });

  // Close trading interface when clicking outside
  document.addEventListener("click", function (event) {
    const isClickInsideTrading = tradingSection.contains(event.target);
    const isClickOnAutoTrade =
      autoTradeBtn && autoTradeBtn.contains(event.target);

    // If click is outside trading area and not on auto-trade button, collapse trading interface
    if (
      !isClickInsideTrading &&
      !isClickOnAutoTrade &&
      tradingSection.classList.contains("expanded")
    ) {
      toggleTradingExpand();
    }
  });

  // Check screen resolution on initialization
  const isHighRes = window.innerWidth >= 2560 || window.innerHeight >= 1440;
  if (isHighRes) {
    tradingSection.style.transform = "none";
  }
}

/**
 * Toggle expand/collapse state of trading interface
 * @returns {void}
 */
function toggleTradingExpand() {
  const tradingSection = document.querySelector(".trading-interface-section");
  const collapseIndicator = document.querySelector(
    ".trading-collapse-indicator"
  );

  tradingSection.classList.toggle("expanded");

  // Update indicator based on state
  if (tradingSection.classList.contains("expanded")) {
    collapseIndicator.className =
      "fas fa-chevron-down trading-collapse-indicator";
  } else {
    collapseIndicator.className =
      "fas fa-chevron-up trading-collapse-indicator";
  }
}

/**
 * Initialize all trading functionality when the DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the trading interface
  initTradingInterface();

  // Setup responsive trading interface
  setupResponsiveTrading();
});
