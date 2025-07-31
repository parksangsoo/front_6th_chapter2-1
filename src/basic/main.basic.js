import {
  AddToCartButton,
  CartItemElement,
  CartItemsContainer,
  GridContainer,
  Header,
  LeftColumn,
  ManualColumn,
  ManualOverlay,
  ManualToggleButton,
  OrderSummaryColumn,
  ProductSelect,
  SelectorContainer,
  StockStatusDiv,
} from './render';

const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  NOTEBOOK_POUCH: 'p4',
  LOFI_SPEAKER: 'p5',
};

// 코드 개선: 가독성 향상, 변수 선언 정리, 중복 제거, forEach 사용, 할인율 상수화
const DISCOUNT_RATES = {
  [PRODUCT_IDS.KEYBOARD]: 0.1,
  [PRODUCT_IDS.MOUSE]: 0.15,
  [PRODUCT_IDS.MONITOR_ARM]: 0.2,
  [PRODUCT_IDS.NOTEBOOK_POUCH]: 0.05,
  [PRODUCT_IDS.LOFI_SPEAKER]: 0.25,
};

const MESSAGES = {
  OUT_OF_STOCK: '품절',
  LOW_STOCK: '재고 부족',
  QTY_ALERT: '재고가 부족합니다.',
  LIGHTNING_SALE_ALERT: (name) => `⚡번개세일! ${name}이(가) 20% 할인 중입니다!`,
  SUGGESTION_ALERT: (name) => `💝 ${name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`,
};

//상품 리스트 변수
const productList = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: '버그 없애는 키보드',
    basePrice: 10000,
    quantity: 50,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: '생산성 폭발 마우스',
    basePrice: 20000,
    quantity: 30,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: '거북목 탈출 모니터암',
    basePrice: 30000,
    quantity: 20,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.NOTEBOOK_POUCH,
    name: '에러 방지 노트북 파우치',
    basePrice: 15000,
    quantity: 0,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.LOFI_SPEAKER,
    name: `코딩할 때 듣는 Lo-Fi 스피커`,
    basePrice: 25000,
    quantity: 10,
    onSale: false,
    suggestSale: false,
  },
];

let itemCnt = 0;
let lastSel = null;
let totalAmt = 0;

function findProductById(productId) {
  return productList.find((product) => product.id === productId);
}

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

function doRenderBonusPoints() {
  // 코드 개선: 변수 선언 방식 통일, 불필요한 변수 제거, 반복문 최적화, 가독성 향상

  let finalPoints = 0;
  const pointsDetail = [];

  const cartItems = DOM.cartItemsContainer.children;
  if (cartItems.length === 0) {
    const ptsTag = document.getElementById('loyalty-points');
    if (ptsTag) ptsTag.style.display = 'none';
    return;
  }

  const basePoints = Math.floor(totalAmt / 1000);
  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push(`기본: ${basePoints}p`);
  }

  // 화요일 2배 포인트
  if (new Date().getDay() === 2 && basePoints > 0) {
    finalPoints = basePoints * 2;
    pointsDetail.push('화요일 2배');
  }

  // 장바구니에 포함된 제품 id Set 생성
  const productSet = new Set(
    Array.from(cartItems)
      .map((node) => findProductById(node.id))
      .filter(Boolean)
      .map((product) => product.id),
  );

  const hasKeyboard = productSet.has(PRODUCT_IDS.KEYBOARD);
  const hasMouse = productSet.has(PRODUCT_IDS.MOUSE);
  const hasMonitorArm = productSet.has(PRODUCT_IDS.MONITOR_ARM);

  // 세트 및 풀세트 포인트 계산
  if (hasKeyboard && hasMouse) {
    finalPoints += 50;
    pointsDetail.push('키보드+마우스 세트 +50p');
    if (hasMonitorArm) {
      finalPoints += 100;
      pointsDetail.push('풀세트 구매 +100p');
    }
  }

  // 대량구매 포인트 계산
  if (itemCnt >= 30) {
    finalPoints += 100;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (itemCnt >= 20) {
    finalPoints += 50;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (itemCnt >= 10) {
    finalPoints += 20;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  const ptsTag = document.getElementById('loyalty-points');
  if (ptsTag) {
    if (finalPoints > 0) {
      ptsTag.innerHTML =
        `<div>적립 포인트: <span class="font-bold">${finalPoints}p</span></div>` +
        `<div class="text-2xs opacity-70 mt-1">${pointsDetail.join(', ')}</div>`;
      ptsTag.style.display = 'block';
    } else {
      ptsTag.textContent = '적립 포인트: 0p';
      ptsTag.style.display = 'block';
    }
  }
}

//장바구니 총액 계산
function handleCalculateCartStuff() {
  let subTot = 0;
  itemCnt = 0;
  var originalTotal;
  totalAmt = 0;

  originalTotal = totalAmt;

  const cartItems = DOM.cartItemsContainer.children;

  const itemDiscounts = [];

  Array.from(cartItems).forEach((itemDiv) => {
    const currentItem = findProductById(itemDiv.id);
    const quantity = parseInt(itemDiv.querySelector('.quantity-number').textContent, 10);

    const itemTot = currentItem.basePrice * quantity;
    let discount = 0;
    itemCnt += quantity;
    subTot += itemTot;

    // 수량 10개 이상일 때 할인 적용
    if (quantity >= 10) {
      discount = DISCOUNT_RATES[currentItem.id] || 0;
      if (discount > 0) {
        itemDiscounts.push({ name: currentItem.name, discount: discount * 100 });
      }
    }

    // 가격 표시 스타일 업데이트
    itemDiv.querySelectorAll('.text-lg').forEach((elem) => {
      elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
    });

    totalAmt += itemTot * (1 - discount);
  });

  let discountRate = 0;
  var originalTotal = subTot;
  if (itemCnt >= 30) {
    totalAmt = (subTot * 75) / 100;
    discountRate = 25 / 100;
  } else {
    discountRate = (subTot - totalAmt) / subTot;
  }
  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdaySpecial = document.getElementById('tuesday-special');
  if (isTuesday) {
    if (totalAmt > 0) {
      totalAmt = (totalAmt * 90) / 100;
      discountRate = 1 - totalAmt / originalTotal;
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
  document.getElementById('item-count').textContent = '🛍️ ' + itemCnt + ' items in cart';

  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';
  if (subTot > 0) {
    // 코드 개선: 가독성 향상, innerHTML 누적 대신 배열로 빌드 후 join, 불필요한 변수 제거
    const details = [];

    Array.from(cartItems).forEach((cartItem) => {
      const curItem = findProductById(cartItem.id);
      const quantity = parseInt(cartItem.querySelector('.quantity-number').textContent, 10);
      const itemTotal = curItem.basePrice * quantity;
      details.push(`
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `);
    });

    details.push(`
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subTot.toLocaleString()}</span>
      </div>
    `);

    if (itemCnt >= 30) {
      details.push(`
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `);
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach((item) => {
        details.push(`
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `);
      });
    }

    if (isTuesday && totalAmt > 0) {
      details.push(`
        <div class="flex justify-between text-sm tracking-wide text-purple-400">
          <span class="text-xs">🌟 화요일 추가 할인</span>
          <span class="text-xs">-10%</span>
        </div>
      `);
    }

    details.push(`
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `);

    summaryDetails.innerHTML = details.join('');
  }
  // 코드 개선: 변수 선언 방식 통일, 가독성 향상
  const totalDiv = DOM.cartTotalDisplay?.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = `₩${Math.round(totalAmt).toLocaleString()}`;
  }
  // 코드 개선: 중복 제거, 가독성 향상
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    const points = Math.floor(totalAmt / 1000);
    loyaltyPointsDiv.textContent = `적립 포인트: ${points > 0 ? points : 0}p`;
    loyaltyPointsDiv.style.display = 'block';
  }
  // 코드 개선: 변수 선언 방식 통일, 가독성 향상, 불필요한 innerHTML 초기화 제거
  const discountInfoDiv = document.getElementById('discount-info');
  if (discountInfoDiv) {
    discountInfoDiv.innerHTML = '';
    if (discountRate > 0 && totalAmt > 0) {
      const savedAmount = originalTotal - totalAmt;
      discountInfoDiv.innerHTML = `
        <div class="bg-green-500/20 rounded-lg p-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
            <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
          </div>
          <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
        </div>
      `;
    }
  }

  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    const previousCount = Number(itemCountElement.dataset.count) || 0;
    itemCountElement.textContent = `🛍️ ${itemCnt} items in cart`;
    itemCountElement.dataset.count = itemCnt;
    itemCountElement.toggleAttribute('data-changed', previousCount !== itemCnt);
  }

  DOM.stockStatus.textContent = productList
    .filter((item) => item.quantity < 5)
    .map((item) =>
      item.quantity > 0
        ? `${item.name}: 재고 부족 (${item.quantity}개 남음)`
        : `${item.name}: 품절`,
    )
    .join('\n');

  doRenderBonusPoints();
}

//1차 리팩토링 완료
function onUpdateSelectOptions() {
  DOM.productSelect.innerHTML = '';

  // 코드 개선: forEach, 템플릿 리터럴, 가독성 향상, 중복 제거
  productList.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.id;

    if (item.quantity === 0) {
      opt.textContent = `${item.name} - ${item.basePrice}원 (품절)${item.onSale ? ' ⚡SALE' : ''}${item.suggestSale ? ' 💝추천' : ''}`;
      opt.disabled = true;
      opt.className = 'text-gray-400';
    } else if (item.onSale && item.suggestSale) {
      opt.textContent = `⚡💝${item.name} - ${item.basePrice}원 → ${item.basePrice}원 (25% SUPER SALE!)`;
      opt.className = 'text-purple-600 font-bold';
    } else if (item.onSale) {
      opt.textContent = `⚡${item.name} - ${item.basePrice}원 → ${item.basePrice}원 (20% SALE!)`;
      opt.className = 'text-red-500 font-bold';
    } else if (item.suggestSale) {
      opt.textContent = `💝${item.name} - ${item.basePrice}원 → ${item.basePrice}원 (5% 추천할인!)`;
      opt.className = 'text-blue-500 font-bold';
    } else {
      opt.textContent = `${item.name} - ${item.basePrice}원${item.onSale ? ' ⚡SALE' : ''}${item.suggestSale ? ' 💝추천' : ''}`;
    }

    DOM.productSelect.appendChild(opt);
  });

  // 전체 재고 수량 계산 및 경고 표시 개선
  const totalStock = productList.reduce((acc, { q }) => acc + q, 0);
  DOM.productSelect.style.borderColor = totalStock < 50 ? 'orange' : '';
}

function doUpdatePricesInCart() {
  // 코드 개선: 중복 제거, 가독성 향상, forEach 사용, 불필요한 변수 제거
  const cartItems = Array.from(DOM.cartItemsContainer.children);

  cartItems.forEach((cartEl) => {
    const itemId = cartEl.id;
    const product = productList.find((p) => p.id === itemId);
    if (!product) return;

    const priceDiv = cartEl.querySelector('.text-lg');
    const nameDiv = cartEl.querySelector('h3');

    if (product.onSale && product.suggestSale) {
      priceDiv.innerHTML = `
        <span class="line-through text-gray-400">₩${product.basePrice.toLocaleString()}</span>
        <span class="text-purple-600">₩${product.basePrice.toLocaleString()}</span>
      `;
      nameDiv.textContent = '⚡💝' + product.name;
    } else if (product.onSale) {
      priceDiv.innerHTML = `
        <span class="line-through text-gray-400">₩${product.basePrice.toLocaleString()}</span>
        <span class="text-red-500">₩${product.basePrice.toLocaleString()}</span>
      `;
      nameDiv.textContent = '⚡' + product.name;
    } else if (product.suggestSale) {
      priceDiv.innerHTML = `
        <span class="line-through text-gray-400">₩${product.basePrice.toLocaleString()}</span>
        <span class="text-blue-500">₩${product.basePrice.toLocaleString()}</span>
      `;
      nameDiv.textContent = '💝' + product.name;
    } else {
      priceDiv.textContent = `₩${product.basePrice.toLocaleString()}`;
      nameDiv.textContent = product.name;
    }
  });

  //할인 적용
  handleCalculateCartStuff();
}

//1차 리팩토링 완료
function initializeDOM() {
  const root = DOM.app;
  const header = Header();
  root.appendChild(header);
  const gridContainer = GridContainer();
  const leftColumn = LeftColumn();
  const selectorContainer = SelectorContainer();
  DOM.productSelect = ProductSelect();
  selectorContainer.appendChild(DOM.productSelect);
  DOM.addToCartBtn = AddToCartButton();
  selectorContainer.appendChild(DOM.addToCartBtn);
  DOM.stockStatus = StockStatusDiv();
  selectorContainer.appendChild(DOM.stockStatus);
  leftColumn.appendChild(selectorContainer);
  DOM.cartItemsContainer = CartItemsContainer();
  leftColumn.appendChild(DOM.cartItemsContainer);
  gridContainer.appendChild(leftColumn);
  const rightColumn = OrderSummaryColumn();
  DOM.cartTotalDisplay = rightColumn.querySelector('#cart-total');
  gridContainer.appendChild(rightColumn);
  root.appendChild(gridContainer);
  DOM.manualOverlay = ManualOverlay();
  DOM.manualColumn = ManualColumn();
  DOM.manualOverlay.appendChild(DOM.manualColumn);
  root.appendChild(DOM.manualOverlay);
  DOM.manualToggleBtn = ManualToggleButton();
  root.appendChild(DOM.manualToggleBtn);
}

//장바구니 추가
function handleAddToCart() {
  //선택한 상품 id
  const selectedProductId = DOM.productSelect.value;
  lastSel = selectedProductId;
  //선택한 상품
  const product = findProductById(selectedProductId);

  if (!selectedProductId || !product) {
    return;
  }

  //선택한 상품의 남은 수량이 있으면
  if (product.quantity > 0) {
    const item = document.getElementById(product.id);
    //선택한 상품의 남은 수량이 있으면
    if (item) {
      const qtyElement = item.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElement.textContent, 10);

      if (product.quantity > 0) {
        qtyElement.textContent = currentQty + 1;
        product.quantity--;
      } else {
        // 재고가 부족합니다.
        alert(MESSAGES.QTY_ALERT);
      }
    } else {
      const newItem = CartItemElement(product);
      DOM.cartItemsContainer.appendChild(newItem);
      product.quantity--;
    }
    //할인 적용
    handleCalculateCartStuff();
  }
}

function handleChangeCartQuantity(target) {
  const productId = target.dataset.productId;
  const itemElem = document.getElementById(productId);
  const qtyElem = itemElem.querySelector('.quantity-number');
  let currentQty = Number(qtyElem.textContent);
  const product = findProductById(productId);

  const qtyChange = Number(target.dataset.change);
  const newQty = currentQty + qtyChange;

  const availableStock = product.quantity + currentQty;
  if (newQty > 0 && newQty <= availableStock) {
    qtyElem.textContent = newQty;
    product.quantity -= qtyChange;
  } else if (newQty <= 0) {
    product.quantity += currentQty;
    itemElem.remove();
  } else {
    alert(MESSAGES.QTY_ALERT);
  }
}

function handleRemoveToCart(target) {
  const productId = target.dataset.productId;
  const itemElem = document.getElementById(productId);
  const product = findProductById(productId);
  const qtyElem = itemElem.querySelector('.quantity-number');
  let currentQty = Number(qtyElem.textContent);
  product.quantity += currentQty;
  itemElem.remove();
}

//1차 리팩토링 완료
function setupEventListeners() {
  DOM.addToCartBtn.addEventListener('click', handleAddToCart);
  // 코드 개선: 가독성 향상, 중복 제거, 변수명 명확화, 불필요한 else 제거
  DOM.cartItemsContainer.addEventListener('click', function (e) {
    // 수량 변경 처리
    const target = e.target;
    if (target.classList.contains('quantity-change')) {
      handleChangeCartQuantity(target);
    }
    // 아이템 제거 처리
    if (target.classList.contains('remove-item')) {
      handleRemoveToCart(target);
    }
    //할인 적용
    handleCalculateCartStuff();
    onUpdateSelectOptions();
  });
  DOM.manualOverlay.addEventListener('click', function (e) {
    if (e.target === DOM.manualOverlay) {
      DOM.manualOverlay.classList.add('hidden');
      DOM.manualColumn.classList.add('translate-x-full');
    }
  });
  DOM.manualToggleBtn.addEventListener('click', function () {
    DOM.manualOverlay.classList.toggle('hidden');
    DOM.manualColumn.classList.toggle('translate-x-full');
  });
}

function activateSalesAndSuggestions() {
  // 번개 세일

  setTimeout(() => {
    setInterval(function () {
      // 번개세일 대상 상품을 무작위로 선택하되, 세일 중이 아니고 재고가 있는 상품만 대상으로 함
      const candidates = productList.filter((item) => item.quantity > 0 && !item.onSale);
      if (candidates.length > 0) {
        const luckyItem = candidates[Math.floor(Math.random() * candidates.length)];
        luckyItem.basePrice = Math.round(luckyItem.basePrice * 0.8);
        luckyItem.onSale = true;
        alert(`⚡번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, Math.random() * 10000);

  setTimeout(() => {
    setInterval(function () {
      if (lastSel) {
        const suggest = productList.find(
          (item) => item.id !== lastSel && item.quantity > 0 && !item.suggestSale,
        );
        if (suggest) {
          alert('💝 ' + suggest.name + '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!');
          suggest.basePrice = Math.round((suggest.basePrice * (100 - 5)) / 100);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, 60000);
  }, Math.random() * 20000);
}

function init() {
  //돔생성
  initializeDOM();
  setupEventListeners();
  onUpdateSelectOptions();
  //할인 적용
  handleCalculateCartStuff();
  //할인 추천 이벤트
  activateSalesAndSuggestions();
}

init();
