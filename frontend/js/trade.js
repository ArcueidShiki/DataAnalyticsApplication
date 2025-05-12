import Http from "./http.js";
import User from "./user.js";
export default class TradeCard {
  static instance = null;
  symbol = null;
  quantity = null;
  currentPrice = null;
  marketPrice = null;
  amount = null;
  maxQtyToBuy = 0;
  maxQtyToSell = 0;
  user = null;
  constructor(symbol, price) {
    if (TradeCard.instance) {
      console.log(
        "TradeCard instance already exists. Returning the existing instance.",
      );
      return TradeCard.instance;
    }
    TradeCard.instance = this;
    this.init();
    this.symbol = symbol;
    this.currentPrice = price;
    this.marketPrice = price;
    this.updateAll = this.updateAll.bind(this);
  }

  static getInstance(symbol = null, price = null) {
    if (!TradeCard.instance) {
      TradeCard.instance = new TradeCard(symbol, price);
    }
    if (symbol) {
      TradeCard.instance.updateSymbol(symbol, price);
    }
    return TradeCard.instance;
  }

  init() {
    this.createTradeCardElements();
    this.initTradingTabs();
    this.initPlaceOrderButton();
    this.setupResponsiveTrading();
  }

  calMaxQty() {
    User.getInstance().update();
    this.user = User.getInstance();
    const cash = this.user.balance["USD"].amount;
    const price = parseFloat($("#tradePrice").val().trim());
    const quantity = parseFloat($("#tradeQuantity").val().trim());
    if (isNaN(price)) {
      return;
    }
    this.maxQtyToBuy = Math.floor(cash / price);
    if (quantity > this.maxQtyToBuy) {
      $("#tradeQuantity").attr("title", "Max Qty to Buy: " + this.maxQtyToBuy);
      $("#tradeQuantity").css("color", "red");
    } else {
      $("#tradeQuantity").removeAttr("title");
      $("#tradeQuantity").css("color", "#4dd118");
    }

    const position = this.user.portfolio[this.symbol];
    this.maxQtyToSell = position ? Math.floor(position.quantity) : 0;
    $(".summary-value.buy").text(this.maxQtyToBuy);
    $(".summary-value.sell").text(this.maxQtyToSell);
  }

  createTradeCardElements() {
    const tradeCard = $(`<div class="trading-interface-section">`);
    tradeCard.append(this.createHeader());
    tradeCard.append(this.createInputGroups());
    tradeCard.append(this.createSummary());
    $(".app-container").append(tradeCard);
    $(".app-container").append(this.createModal());
  }
  createHeader() {
    return $(`
      <div class="section-header">
        <div class="section-title">Trade</div>
      </div>

      <div class="trading-type-options">
        <button class="type-option active" data-type="stocks">
          NVDA
        </button>
      </div>
    `);
  }

  createInputGroups() {
    return $(`
      <div class="trading-input-group">
        <div class="trading-input-label">Price</div>
        <div class="trading-input-container">
          <input
            type="number"
            class="trading-input"
            id="tradePrice"
            value=""
            min="0"
            placeholder="0"
          />
          <div class="trading-input-suffix">USD</div>
          <div class="trading-input-controls">
            <button class="input-control decrease">
              <i class="fas fa-minus"></i>
            </button>
            <button class="input-control increase">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="trading-input-group">
        <div class="trading-input-label">Quantity</div>
        <div class="trading-input-container">
          <input
            type="number"
            class="trading-input"
            id="tradeQuantity"
            step="1"
            min="0"
            placeholder="0"
            data-toggle="tooltip" data-placement="top" title="Please enter a number"
          />
        </div>
      </div>

      <div class="trading-input-group">
        <div class="trading-input-label">Amount</div>
        <div class="trading-input-container">
          <input
          type="number"
          class="trading-input"
          id="amount"
          value="0"
          readonly
        />
          <div class="trading-input-suffix">USD</div>
        </div>
      </div>
    `);
  }

  createSummary() {
    return $(`
      <div class="trading-summary">
        <div class="summary-item">
          <div class="summary-label">
            Max Qty to Buy(Cash): <span class="summary-value buy">19</span>
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-label">
            Max Qty to Sell: <span class="summary-value sell">65</span>
          </div>
        </div>
      </div>
      <div class="trading-tabs">
        <button class="trading-tab active" data-action="buy">
          Buy
        </button>
        <button class="trading-tab" data-action="sell">Sell</button>
      </div>
      <button class="place-order-button btn" data-toggle="modal" data-target="#confirmOrderModal">Place Order</button>
    `);
  }

  updateSymbol(symbol, price) {
    this.symbol = symbol;
    this.currentPrice = price;
    this.marketPrice = price;
    $(".type-option.active").text(symbol);
    $("#tradePrice").val(price);
  }

  initTradingTabs() {
    const tradingTabs = $(".trading-tab");
    tradingTabs.each(function () {
      $(this).on("click", function () {
        tradingTabs.each(function () {
          $(this).removeClass("active");
        });
        $(this).addClass("active");
        const placeOrderButton = $(".place-order-button");
        if (placeOrderButton) {
          let action = $(this).attr("data-action");
          placeOrderButton.text(
            action === "buy" ? "Place Buy Order" : "Place Sell Order",
          );
          placeOrderButton.removeClass("buy-action sell-action");
          action = $(this).attr("data-action");
          placeOrderButton.addClass(`${action}-action`);
        }
      });
    });
  }

  updateAll() {
    $("#tradePrice").val(this.currentPrice.toFixed(2));
    $("#tradeQuantity").val(this.quantity);
    this.amount = this.currentPrice * this.quantity;
    $("#amount").val(this.amount.toFixed(2));
    this.calMaxQty();
  }

  initPriceControls() {
    this.currentPrice = parseFloat($("#currentPrice").text());
    this.marketPrice = this.currentPrice;
    const priceInput = $("#tradePrice");
    const quantityInput = $("#tradeQuantity");
    const decreaseBtn = $(".decrease");
    const increaseBtn = $(".increase");
    priceInput.val(this.currentPrice.toFixed(2));
    this.calMaxQty();

    decreaseBtn.on("click", () => {
      this.currentPrice -= 0.01;
      this.updateAll();
    });

    increaseBtn.on("click", () => {
      this.currentPrice += 0.01;
      this.updateAll();
    });

    priceInput.on("input", (event) => {
      const value = event.target.value;
      event.target.value = value.replace(/[^0-9]/g, "");
      this.currentPrice = event.target.value;
      this.updateAll();
    });
    priceInput.on("keypress", (event) => {
      const charCode = event.which || event.keyCode;
      // (-) (.)
      if (charCode === 45 || charCode === 46) {
        event.preventDefault();
      }
    });
    priceInput.on("blur", () => {
      const value = parseFloat(priceInput.val());
      if (isNaN(value) || value < 0) {
        alert("Please enter a valid non-negative number.");
        priceInput.val(this.currentPrice);
      }
    });
    quantityInput.on("input", (event) => {
      const value = event.target.value;
      event.target.value = value.replace(/[^0-9]/g, "");
      this.quantity = event.target.value;
      this.updateAll();
    });

    quantityInput.on("keypress", (event) => {
      const charCode = event.which || event.keyCode;
      // (-) (.)
      if (charCode === 45 || charCode === 46) {
        event.preventDefault();
      }
    });
    quantityInput.on("blur", () => {
      const value = parseFloat(quantityInput.val());
      if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
        alert("Please enter a valid non-negative integer.");
        quantityInput.val("");
      }
    });
  }

  createModal() {
    return $(`
      <div class="modal fade" id="confirmOrderModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Confirm Order</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              ...
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-success" type="button" id="confirm-order-btn">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  checkOrder(action) {
    if (this.currentPrice <= 0) {
      return {
        isValid: false,
        msg: "Price must be greater than 0",
      };
    }
    if (this.currentPrice < this.marketPrice) {
      return {
        isValid: false,
        msg: "Price must be greater than or equal to market price",
      };
    }
    if (this.quantity <= 0) {
      return {
        isValid: false,
        msg: "Quantity must be greater than 0",
      };
    }
    if (
      (this.quantity > this.maxQtyToBuy && action == "buy") ||
      (this.quantity > this.maxQtyToSell && action == "sell")
    ) {
      return {
        isValid: false,
        msg: "Exceeds max quantity",
      };
    }

    if (this.currentPrice > this.marketPrice) {
      console.log("Price is higher than market price", this.marketPrice);
      return {
        isValid: true,
        msg: "Your price is higher than market price",
      };
    }
    return {
      isValid: true,
      msg: "",
    };
  }

  showAlertDialog(msg) {
    $(".modal-title").text("Warning");
    $(".modal-body").text(msg);
    $("#confirm-order-btn").css("display", "none");
    $("#confirmOrderModal").modal({
      backdrop: false,
    });
  }

  showConfirmDialog(msg, action) {
    $(".modal-title").text("Confirm Order");
    $(".modal-body").text(
      `${action.toUpperCase()}  ${this.quantity} ${this.symbol} shares at $${this.currentPrice.toFixed(2)} ${msg}`,
    );
    $("#confirm-order-btn").css("display", "block");
    $("#confirmOrderModal").modal({
      backdrop: false,
    });
    $("#confirm-order-btn")
      .off("click")
      .on("click", () => {
        const orderData = {
          symbol: this.symbol,
          price: parseFloat(this.currentPrice),
          quantity: parseInt(this.quantity),
        };
        Http.post(`/stock/${action}`, orderData)
          .then((response) => {
            User.getInstance().updateBalance(response.balance);
            User.getInstance().updatePortfolio(response.portfolio);
            $("#confirmOrderModal").modal("hide");
            $(".modal-body").empty();
          })
          .catch((error) => {
            console.error("Error placing order:", error);
          });
      });
  }

  initPlaceOrderButton() {
    const placeOrderButton = $(".place-order-button");
    placeOrderButton.on("click", () => {
      const action = $(".trading-tab.active").attr("data-action");
      const { isValid, msg } = this.checkOrder(action);
      if (!isValid) {
        this.showAlertDialog(msg);
        return;
      }
      this.showConfirmDialog(msg, action);
    });
  }

  toggleTradingExpand() {
    const tradingSection = $(".trading-interface-section");
    tradingSection.toggleClass("expanded");
    this.initPriceControls();
  }

  setupResponsiveTrading() {
    const tradingSection = document.querySelector(".trading-interface-section");
    const tradingHeader = tradingSection
      ? tradingSection.querySelector(".section-header")
      : null;
    const autoTradeBtn = document.querySelector(".action-btn.buy-btn");
    if (!tradingSection || !tradingHeader) return;
    const sectionContent = document.createElement("div");
    sectionContent.className = "section-content";
    while (tradingSection.children.length > 1) {
      sectionContent.appendChild(tradingSection.children[1]);
    }

    tradingSection.appendChild(sectionContent);
    const collapseIndicator = document.createElement("i");
    collapseIndicator.className =
      "fas fa-chevron-up trading-collapse-indicator";
    const titleElement = tradingHeader.querySelector(".section-title");
    if (titleElement) {
      titleElement.appendChild(collapseIndicator);
    }
    const tradeBadge = document.createElement("div");
    tradeBadge.className = "trade-badge";
    tradeBadge.textContent = "SPOT";
    tradingHeader.appendChild(tradeBadge);
    tradingHeader.addEventListener("click", () => {
      this.toggleTradingExpand();
    });
    if (autoTradeBtn) {
      autoTradeBtn.addEventListener("click", () => {
        if (!tradingSection.classList.contains("expanded")) {
          this.toggleTradingExpand();
        }
      });
    }
    document.addEventListener("click", (event) => {
      const isClickInsideTrading = tradingSection.contains(event.target);
      const isClickOnAutoTrade =
        autoTradeBtn && autoTradeBtn.contains(event.target);
      if (
        !isClickInsideTrading &&
        !isClickOnAutoTrade &&
        tradingSection.classList.contains("expanded")
      ) {
        this.toggleTradingExpand();
      }
    });
    const isHighRes = window.innerWidth >= 2560 || window.innerHeight >= 1440;
    if (isHighRes) {
      tradingSection.style.transform = "none";
    }
  }
}
