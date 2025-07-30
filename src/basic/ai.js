// constants.js
const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  NOTEBOOK_POUCH: 'p4',
  LOFI_SPEAKER: 'p5',
};

const DISCOUNT_RATES = {
  KEYBOARD_QTY_10: 0.1,
  MOUSE_QTY_10: 0.15,
  MONITOR_ARM_QTY_10: 0.2,
  NOTEBOOK_POUCH_QTY_10: 0.05,
  LOFI_SPEAKER_QTY_10: 0.25,
  BULK_ORDER_30: 0.25,
  TUESDAY_SPECIAL: 0.1,
  LIGHTNING_SALE: 0.2,
  SUGGESTION_SALE: 0.05,
};

const BONUS_POINTS_RULES = {
  BASE_RATE_PER_1000: 1, // 1000원당 1포인트
  TUESDAY_MULTIPLIER: 2,
  KEYBOARD_MOUSE_SET: 50,
  FULL_SET: 100,
  BULK_10_PLUS: 20,
  BULK_20_PLUS: 50,
  BULK_30_PLUS: 100,
};

const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  CRITICAL_STOCK_WARNING: 30, // 전체 재고 30개 미만
  TOTAL_STOCK_WARNING: 50, // 셀렉트 박스 테두리 주황색 기준
};

const MESSAGES = {
  OUT_OF_STOCK: '품절',
  LOW_STOCK: '재고 부족',
  QTY_ALERT: '재고가 부족합니다.',
  LIGHTNING_SALE_ALERT: (name) => `⚡번개세일! ${name}이(가) 20% 할인 중입니다!`,
  SUGGESTION_ALERT: (name) => `💝 ${name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`,
};

// data.js
const productList = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: '버그 없애는 키보드',
    basePrice: 10000,
    quantity: 50,
    onSale: false,
    suggestSale: false,
    get currentPrice() {
      let price = this.basePrice;
      if (this.onSale) price = Math.round(price * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
      if (this.suggestSale) price = Math.round(price * (1 - DISCOUNT_RATES.SUGGESTION_SALE));
      return price;
    },
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: '생산성 폭발 마우스',
    basePrice: 20000,
    quantity: 30,
    onSale: false,
    suggestSale: false,
    get currentPrice() {
      let price = this.basePrice;
      if (this.onSale) price = Math.round(price * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
      if (this.suggestSale) price = Math.round(price * (1 - DISCOUNT_RATES.SUGGESTION_SALE));
      return price;
    },
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: '거북목 탈출 모니터암',
    basePrice: 30000,
    quantity: 20,
    onSale: false,
    suggestSale: false,
    get currentPrice() {
      let price = this.basePrice;
      if (this.onSale) price = Math.round(price * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
      if (this.suggestSale) price = Math.round(price * (1 - DISCOUNT_RATES.SUGGESTION_SALE));
      return price;
    },
  },
  {
    id: PRODUCT_IDS.NOTEBOOK_POUCH,
    name: '에러 방지 노트북 파우치',
    basePrice: 15000,
    quantity: 0,
    onSale: false,
    suggestSale: false,
    get currentPrice() {
      let price = this.basePrice;
      if (this.onSale) price = Math.round(price * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
      if (this.suggestSale) price = Math.round(price * (1 - DISCOUNT_RATES.SUGGESTION_SALE));
      return price;
    },
  },
  {
    id: PRODUCT_IDS.LOFI_SPEAKER,
    name: `코딩할 때 듣는 Lo-Fi 스피커`,
    basePrice: 25000,
    quantity: 10,
    onSale: false,
    suggestSale: false,
    get currentPrice() {
      let price = this.basePrice;
      if (this.onSale) price = Math.round(price * (1 - DISCOUNT_RATES.LIGHTNING_SALE));
      if (this.suggestSale) price = Math.round(price * (1 - DISCOUNT_RATES.SUGGESTION_SALE));
      return price;
    },
  },
];

function findProductById(productId) {
  return productList.find((product) => product.id === productId);
}

// state.js (전역 상태 관리 - 필요에 따라 더 정교한 상태 관리 라이브러리 도입 고려)
let cartState = {
  items: {}, // { productId: quantity }
  lastSelectedItem: null,
};

// selectors.js (DOM 요소 셀렉터)
const DOM = {
  app: document.getElementById('app'),
  productSelect: null, // 초기화 시 할당
  addToCartBtn: null,
  stockStatus: null,
  cartItemsContainer: null,
  summaryDetails: null,
  discountInfo: null,
  cartTotalDisplay: null,
  loyaltyPointsDisplay: null,
  tuesdaySpecialDisplay: null,
  itemCountDisplay: null,
  manualOverlay: null,
  manualColumn: null,
  manualToggleBtn: null,
};

// cartLogic.js
function calculateItemDiscountRate(productId, quantity) {
  if (quantity < 10) return 0;

  switch (productId) {
    case PRODUCT_IDS.KEYBOARD:
      return DISCOUNT_RATES.KEYBOARD_QTY_10;
    case PRODUCT_IDS.MOUSE:
      return DISCOUNT_RATES.MOUSE_QTY_10;
    case PRODUCT_IDS.MONITOR_ARM:
      return DISCOUNT_RATES.MONITOR_ARM_QTY_10;
    case PRODUCT_IDS.NOTEBOOK_POUCH:
      return DISCOUNT_RATES.NOTEBOOK_POUCH_QTY_10;
    case PRODUCT_IDS.LOFI_SPEAKER:
      return DISCOUNT_RATES.LOFI_SPEAKER_QTY_10;
    default:
      return 0;
  }
}

function calculateCartTotals() {
  let subtotal = 0;
  let totalAmount = 0;
  let totalItemCount = 0;
  const itemDiscounts = [];
  const today = new Date();
  const isTuesday = today.getDay() === TUESDAY;

  for (const productId in cartState.items) {
    const quantity = cartState.items[productId];
    const product = findProductById(productId);

    if (!product) continue;

    const itemTotal = product.currentPrice * quantity;
    const itemDiscountRate = calculateItemDiscountRate(productId, quantity);

    subtotal += itemTotal;
    totalAmount += itemTotal * (1 - itemDiscountRate);
    totalItemCount += quantity;

    if (itemDiscountRate > 0) {
      itemDiscounts.push({ name: product.name, discount: itemDiscountRate * 100 });
    }
  }

  // 전체 수량 할인 적용
  let finalDiscountRate = 0;
  if (totalItemCount >= 30) {
    totalAmount = subtotal * (1 - DISCOUNT_RATES.BULK_ORDER_30);
    finalDiscountRate = DISCOUNT_RATES.BULK_ORDER_30;
  } else if (itemDiscounts.length > 0) {
    finalDiscountRate = (subtotal - totalAmount) / subtotal || 0;
  }

  // 화요일 특별 할인 적용
  if (isTuesday && totalAmount > 0) {
    totalAmount *= 1 - DISCOUNT_RUES.TUESDAY_SPECIAL;
    finalDiscountRate = 1 - totalAmount / subtotal; // 전체 할인율 재계산
  }

  const savedAmount = subtotal - totalAmount;

  return {
    subtotal,
    totalAmount,
    totalItemCount,
    itemDiscounts,
    finalDiscountRate,
    savedAmount,
    isTuesday,
  };
}

function calculateBonusPoints(totalAmount, totalItemCount, cartProductIds) {
  if (totalAmount === 0) return { bonusPts: 0, details: [] };

  let basePoints = Math.floor(totalAmount / 1000) * BONUS_POINTS_RULES.BASE_RATE_PER_1000;
  let finalPoints = basePoints;
  const pointsDetails = [];

  if (basePoints > 0) {
    pointsDetails.push(`기본: ${basePoints}p`);
  }

  if (new Date().getDay() === TUESDAY && basePoints > 0) {
    finalPoints *= BONUS_POINTS_RULES.TUESDAY_MULTIPLIER;
    pointsDetails.push('화요일 2배');
  }

  const hasKeyboard = cartProductIds.includes(PRODUCT_IDS.KEYBOARD);
  const hasMouse = cartProductIds.includes(PRODUCT_IDS.MOUSE);
  const hasMonitorArm = cartProductIds.includes(PRODUCT_IDS.MONITOR_ARM);

  if (hasKeyboard && hasMouse) {
    finalPoints += BONUS_POINTS_RULES.KEYBOARD_MOUSE_SET;
    pointsDetails.push('키보드+마우스 세트 +50p');
  }
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints += BONUS_POINTS_RULES.FULL_SET;
    pointsDetails.push('풀세트 구매 +100p');
  }

  if (totalItemCount >= 30) {
    finalPoints += BONUS_POINTS_RULES.BULK_30_PLUS;
    pointsDetails.push('대량구매(30개+) +100p');
  } else if (totalItemCount >= 20) {
    finalPoints += BONUS_POINTS_RULES.BULK_20_PLUS;
    pointsDetails.push('대량구매(20개+) +50p');
  } else if (totalItemCount >= 10) {
    finalPoints += BONUS_POINTS_RULES.BULK_10_PLUS;
    pointsDetails.push('대량구매(10개+) +20p');
  }

  return { bonusPts: finalPoints, details: pointsDetails };
}

// renderUtils.js
function renderCartItem(product, quantity) {
  const newItem = document.createElement('div');
  newItem.id = product.id;
  newItem.className =
    'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';

  const originalPriceHtml = `<span class="line-through text-gray-400">₩${product.basePrice.toLocaleString()}</span>`;
  let currentPriceHtml = `<span>₩${product.currentPrice.toLocaleString()}</span>`;
  let namePrefix = '';

  if (product.onSale && product.suggestSale) {
    currentPriceHtml = `<span class="text-purple-600">₩${product.currentPrice.toLocaleString()}</span>`;
    namePrefix = '⚡💝';
  } else if (product.onSale) {
    currentPriceHtml = `<span class="text-red-500">₩${product.currentPrice.toLocaleString()}</span>`;
    namePrefix = '⚡';
  } else if (product.suggestSale) {
    currentPriceHtml = `<span class="text-blue-500">₩${product.currentPrice.toLocaleString()}</span>`;
    namePrefix = '💝';
  }

  newItem.innerHTML = `
    <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
      <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
    </div>
    <div>
      <h3 class="text-base font-normal mb-1 tracking-tight">${namePrefix}${product.name}</h3>
      <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
      <p class="text-xs text-black mb-3">
        ${product.onSale || product.suggestSale ? originalPriceHtml : ''} ${currentPriceHtml}
      </p>
      <div class="flex items-center gap-4">
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
        <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">${quantity}</span>
        <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg mb-2 tracking-tight tabular-nums">${product.onSale || product.suggestSale ? originalPriceHtml : ''} ${currentPriceHtml}</div>
      <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
    </div>
  `;
  return newItem;
}

function updateCartDisplay() {
  DOM.cartItemsContainer.innerHTML = '';
  for (const productId in cartState.items) {
    const quantity = cartState.items[productId];
    const product = findProductById(productId);
    if (product) {
      DOM.cartItemsContainer.appendChild(renderCartItem(product, quantity));
    }
  }
}

function updateSelectOptions() {
  DOM.productSelect.innerHTML = '';
  let totalStock = 0;

  productList.forEach((item) => {
    totalStock += item.quantity;
    const opt = document.createElement('option');
    opt.value = item.id;

    let discountPrefix = '';
    if (item.onSale && item.suggestSale) discountPrefix = '⚡💝';
    else if (item.onSale) discountPrefix = '⚡';
    else if (item.suggestSale) discountPrefix = '💝';

    const priceText =
      item.basePrice === item.currentPrice
        ? `₩${item.basePrice.toLocaleString()}`
        : `<span class="line-through text-gray-400">₩${item.basePrice.toLocaleString()}</span> <span class="${item.onSale && item.suggestSale ? 'text-purple-600' : item.onSale ? 'text-red-500' : 'text-blue-500'}">₩${item.currentPrice.toLocaleString()}</span>`;

    if (item.quantity === 0) {
      opt.textContent = `${discountPrefix}${item.name} - ${item.basePrice.toLocaleString()}원 (${MESSAGES.OUT_OF_STOCK})`;
      opt.disabled = true;
      opt.className = 'text-gray-400';
    } else {
      opt.textContent = `${discountPrefix}${item.name} - ${priceText}`;
      opt.className = item.onSale || item.suggestSale ? 'font-bold' : '';
      if (item.onSale && item.suggestSale) opt.classList.add('text-purple-600');
      else if (item.onSale) opt.classList.add('text-red-500');
      else if (item.suggestSale) opt.classList.add('text-blue-500');
    }
    DOM.productSelect.appendChild(opt);
  });

  DOM.productSelect.style.borderColor =
    totalStock < STOCK_THRESHOLDS.TOTAL_STOCK_WARNING ? 'orange' : '';
}

function updateStockInfoDisplay() {
  let infoMsg = '';
  productList.forEach((item) => {
    if (item.quantity < STOCK_THRESHOLDS.LOW_STOCK) {
      if (item.quantity > 0) {
        infoMsg += `${item.name}: ${MESSAGES.LOW_STOCK} (${item.quantity}개 남음)\n`;
      } else {
        infoMsg += `${item.name}: ${MESSAGES.OUT_OF_STOCK}\n`;
      }
    }
  });
  DOM.stockStatus.textContent = infoMsg;
}

function updateSummaryAndTotals() {
  const {
    subtotal,
    totalAmount,
    totalItemCount,
    itemDiscounts,
    finalDiscountRate,
    savedAmount,
    isTuesday,
  } = calculateCartTotals();
  const cartProductIds = Object.keys(cartState.items);
  const { bonusPts, details: pointsDetails } = calculateBonusPoints(
    totalAmount,
    totalItemCount,
    cartProductIds,
  );

  // Item Count
  DOM.itemCountDisplay.textContent = `🛍️ ${totalItemCount} items in cart`;

  // Summary Details
  let summaryHtml = '';
  if (subtotal > 0) {
    for (const productId in cartState.items) {
      const quantity = cartState.items[productId];
      const product = findProductById(productId);
      if (product) {
        const itemTotal = product.currentPrice * quantity;
        summaryHtml += `
          <div class="flex justify-between text-xs tracking-wide text-gray-400">
            <span>${product.name} x ${quantity}</span>
            <span>₩${itemTotal.toLocaleString()}</span>
          </div>
        `;
      }
    }
    summaryHtml += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subtotal.toLocaleString()}</span>
      </div>
    `;

    if (totalItemCount >= 30) {
      summaryHtml += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-${(DISCOUNT_RATES.BULK_ORDER_30 * 100).toFixed(0)}%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach((item) => {
        summaryHtml += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }

    if (isTuesday && totalAmount > 0) {
      summaryHtml += `
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-${(DISCOUNT_RATES.TUESDAY_SPECIAL * 100).toFixed(0)}%</span>
        </div>
      `;
    }
    summaryHtml += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
  DOM.summaryDetails.innerHTML = summaryHtml;

  // Total Amount Display
  DOM.cartTotalDisplay.textContent = `₩${Math.round(totalAmount).toLocaleString()}`;

  // Loyalty Points
  if (bonusPts > 0) {
    DOM.loyaltyPointsDisplay.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${bonusPts}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetails.join(', ')}</div>
    `;
    DOM.loyaltyPointsDisplay.style.display = 'block';
  } else {
    DOM.loyaltyPointsDisplay.textContent = '적립 포인트: 0p';
    DOM.loyaltyPointsDisplay.style.display = 'block';
  }

  // Discount Info
  DOM.discountInfo.innerHTML = '';
  if (finalDiscountRate > 0 && totalAmount > 0) {
    DOM.discountInfo.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(finalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }

  // Tuesday Special Badge
  if (isTuesday && totalAmount > 0) {
    DOM.tuesdaySpecialDisplay.classList.remove('hidden');
  } else {
    DOM.tuesdaySpecialDisplay.classList.add('hidden');
  }
}

// eventHandlers.js
function handleAddToCart() {
  const selectedProductId = DOM.productSelect.value;
  const productToAdd = findProductById(selectedProductId);

  if (!selectedProductId || !productToAdd) {
    return;
  }

  if (productToAdd.quantity > 0) {
    cartState.items[selectedProductId] = (cartState.items[selectedProductId] || 0) + 1;
    productToAdd.quantity--; // 실제 재고 감소

    cartState.lastSelectedItem = selectedProductId; // 마지막 선택 상품 업데이트

    updateCartDisplay();
    updateSummaryAndTotals();
    updateStockInfoDisplay();
    updateSelectOptions();
  } else {
    alert(MESSAGES.QTY_ALERT);
  }
}

function handleCartItemChange(event) {
  const target = event.target;

  if (target.classList.contains('quantity-change') || target.classList.contains('remove-item')) {
    const productId = target.dataset.productId;
    const product = findProductById(productId);

    if (!product) return;

    const currentQuantityInCart = cartState.items[productId] || 0;

    if (target.classList.contains('quantity-change')) {
      const change = parseInt(target.dataset.change);
      const newQuantityInCart = currentQuantityInCart + change;

      if (newQuantityInCart > 0 && product.quantity - change >= 0) {
        cartState.items[productId] = newQuantityInCart;
        product.quantity -= change;
      } else if (newQuantityInCart <= 0) {
        // Remove item from cart if quantity becomes 0 or less
        product.quantity += currentQuantityInCart; // 재고 원복
        delete cartState.items[productId];
      } else {
        alert(MESSAGES.QTY_ALERT);
      }
    } else if (target.classList.contains('remove-item')) {
      // Remove item entirely
      product.quantity += currentQuantityInCart; // 재고 원복
      delete cartState.items[productId];
    }

    updateCartDisplay();
    updateSummaryAndTotals();
    updateStockInfoDisplay();
    updateSelectOptions();
  }
}

function handleManualOverlayClick(e) {
  if (e.target === DOM.manualOverlay) {
    DOM.manualOverlay.classList.add('hidden');
    DOM.manualColumn.classList.add('translate-x-full');
  }
}

function toggleManualPanel() {
  DOM.manualOverlay.classList.toggle('hidden');
  DOM.manualColumn.classList.toggle('translate-x-full');
}

// init.js (초기화 및 메인 로직)
function initializeDOM() {
  const root = DOM.app;

  // Header
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  root.appendChild(header);
  DOM.itemCountDisplay = document.getElementById('item-count');

  // Grid Container
  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  // Left Column (Product Selector & Cart Items)
  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  DOM.productSelect = document.createElement('select');
  DOM.productSelect.id = 'product-select';
  DOM.productSelect.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';
  selectorContainer.appendChild(DOM.productSelect);

  DOM.addToCartBtn = document.createElement('button');
  DOM.addToCartBtn.id = 'add-to-cart';
  DOM.addToCartBtn.innerHTML = 'Add to Cart';
  DOM.addToCartBtn.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';
  selectorContainer.appendChild(DOM.addToCartBtn);

  DOM.stockStatus = document.createElement('div');
  DOM.stockStatus.id = 'stock-status';
  DOM.stockStatus.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';
  selectorContainer.appendChild(DOM.stockStatus);

  leftColumn.appendChild(selectorContainer);

  DOM.cartItemsContainer = document.createElement('div');
  DOM.cartItemsContainer.id = 'cart-items';
  leftColumn.appendChild(DOM.cartItemsContainer);

  gridContainer.appendChild(leftColumn);

  // Right Column (Order Summary)
  const rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;
  DOM.summaryDetails = rightColumn.querySelector('#summary-details');
  DOM.discountInfo = rightColumn.querySelector('#discount-info');
  DOM.cartTotalDisplay = rightColumn.querySelector('#cart-total .text-2xl');
  DOM.loyaltyPointsDisplay = rightColumn.querySelector('#loyalty-points');
  DOM.tuesdaySpecialDisplay = rightColumn.querySelector('#tuesday-special');
  gridContainer.appendChild(rightColumn);

  root.appendChild(gridContainer);

  // Manual Overlay & Column
  DOM.manualOverlay = document.createElement('div');
  DOM.manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  DOM.manualOverlay.addEventListener('click', handleManualOverlayClick);

  DOM.manualColumn = document.createElement('div');
  DOM.manualColumn.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  DOM.manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;
  DOM.manualOverlay.appendChild(DOM.manualColumn);
  root.appendChild(DOM.manualOverlay);

  DOM.manualToggleBtn = document.createElement('button');
  DOM.manualToggleBtn.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  DOM.manualToggleBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;
  root.appendChild(DOM.manualToggleBtn);
}

function setupEventListeners() {
  DOM.addToCartBtn.addEventListener('click', handleAddToCart);
  DOM.cartItemsContainer.addEventListener('click', handleCartItemChange);
  DOM.manualToggleBtn.addEventListener('click', toggleManualPanel);
}

function activateSalesAndSuggestions() {
  // 번개 세일
  const lightningDelay = Math.random() * 10000;
  setTimeout(() => {
    setInterval(() => {
      const availableProducts = productList.filter((p) => p.quantity > 0 && !p.onSale);
      if (availableProducts.length > 0) {
        const luckyItem = availableProducts[Math.floor(Math.random() * availableProducts.length)];
        luckyItem.onSale = true;
        alert(MESSAGES.LIGHTNING_SALE_ALERT(luckyItem.name));
        updateSelectOptions();
        updateCartDisplay(); // 장바구니에 이미 담긴 상품 가격도 업데이트
        updateSummaryAndTotals();
      }
    }, 30000);
  }, lightningDelay);

  // 추천 할인
  const suggestionDelay = Math.random() * 20000;
  setTimeout(() => {
    setInterval(() => {
      if (!cartState.lastSelectedItem) return;

      const availableForSuggestion = productList.filter(
        (p) => p.id !== cartState.lastSelectedItem && p.quantity > 0 && !p.suggestSale,
      );

      if (availableForSuggestion.length > 0) {
        const suggestedItem =
          availableForSuggestion[Math.floor(Math.random() * availableForSuggestion.length)];
        suggestedItem.suggestSale = true;
        alert(MESSAGES.SUGGESTION_ALERT(suggestedItem.name));
        updateSelectOptions();
        updateCartDisplay(); // 장바구니에 이미 담긴 상품 가격도 업데이트
        updateSummaryAndTotals();
      }
    }, 60000);
  }, suggestionDelay);
}

function init() {
  initializeDOM();
  setupEventListeners();
  updateSelectOptions(); // 초기 상품 목록 렌더링
  updateStockInfoDisplay(); // 초기 재고 상태 렌더링
  updateSummaryAndTotals(); // 초기 장바구니 요약 렌더링
  activateSalesAndSuggestions(); // 할인/추천 이벤트 활성화
}

// 앱 시작
init();
