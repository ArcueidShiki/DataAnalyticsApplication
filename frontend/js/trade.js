import Http from "./http.js";
import User from "./user.js";
export default class TradeCard {
  static instance = null;
  symbol = null;
  quantity = null;
  currentPrice = null;
  targetPrice = null;
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
    this.user = User.getInstance();
    const cash = this.user.balance[0].amount;
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

    if (!this.user.portfolio) {
      this.maxQtyToSell = 0;
      return;
    }
    const stock = this.user.portfolio.find(
      (stock) => stock.symbol === this.symbol,
    );
    if (stock) {
      this.maxQtyToSell = Math.floor(stock.quantity);
    } else {
      this.maxQtyToSell = 0;
    }
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
            value="152.35"
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

    priceInput.on("input", () => {
      this.currentPrice = parseFloat(priceInput.val());
      this.updateAll();
    });

    quantityInput.on("input", () => {
      this.quantity = parseFloat(quantityInput.val());
      this.updateAll();
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
              <button type="button" class="btn btn-success" id="confirm-order-btn">Submit</button>
            </div>
          </div>
        </div>
      </div>
    `)
  }

  initPlaceOrderButton() {
    const placeOrderButton = $(".place-order-button");
    placeOrderButton.on("click", () => {
      console.log("Place Order Button Clicked");
      const action = $(".trading-tab.active").attr("data-action");
      $(".modal-body").text(`${action.toUpperCase()}  ${this.quantity} ${this.symbol} shares at $${this.currentPrice}`);
      $("#confirmOrderModal").modal({
        backdrop: false,
      });
      $("#confirm-order-btn").off("click").on("click", () => {
        const orderData = {
          symbol: this.symbol,
          price: this.currentPrice,
          quantity: this.quantity,
          action: action,
        };
        Http.post("/stock/buy", orderData)
          .then((response) => {
            console.log("Order placed successfully:", response);
            $("#confirmOrderModal").modal("hide");
            $(".modal-body").empty();
          })
          .catch((error) => {
            console.error("Error placing order:", error);
          });
      });
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
