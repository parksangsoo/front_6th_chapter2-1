import {
  AddToCartButton,
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

var stockInfo;
var itemCnt = 0;
var lastSel = null;

var totalAmt = 0;

var sum;

const PRODUCT_IDS = {
  KEYBOARD: 'p1',
  MOUSE: 'p2',
  MONITOR_ARM: 'p3',
  NOTEBOOK_POUCH: 'p4',
  LOFI_SPEAKER: 'p5',
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
    q: 50,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: '생산성 폭발 마우스',
    basePrice: 20000,
    q: 30,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: '거북목 탈출 모니터암',
    basePrice: 30000,
    q: 20,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.NOTEBOOK_POUCH,
    name: '에러 방지 노트북 파우치',
    basePrice: 15000,
    q: 0,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.LOFI_SPEAKER,
    name: `코딩할 때 듣는 Lo-Fi 스피커`,
    basePrice: 25000,
    q: 10,
    onSale: false,
    suggestSale: false,
  },
];

function findProductById(productId) {
  return productList.find((product) => product.id === productId);
}

let cartState = {
  items: {}, // { productId: quantity }
  lastSelectedItem: null,
};

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

function handleStockInfoUpdate() {
  const infoMsg = productList
    .filter((item) => item.q < 5)
    .map((item) =>
      item.q > 0 ? `${item.name}: 재고 부족 (${item.q}개 남음)` : `${item.name}: 품절`,
    )
    .join('\n');
  stockInfo.textContent = infoMsg;
}

function handleCalculateCartStuff() {
  let subTot = 0;

  var savedAmount;
  var summaryDetails;
  var totalDiv;
  var loyaltyPointsDiv;
  var points;
  var discountInfoDiv;
  var itemCountElement;
  var previousCount;
  itemCnt = 0;

  var originalTotal;
  totalAmt = 0;

  originalTotal = totalAmt;

  const cartItems = DOM.cartItemsContainer.children;

  const itemDiscounts = [];

  // 코드 개선: 가독성 향상, 변수 선언 정리, 중복 제거, forEach 사용, 할인율 상수화
  const DISCOUNT_RATES = {
    [PRODUCT_IDS.KEYBOARD]: 0.1,
    [PRODUCT_IDS.MOUSE]: 0.15,
    [PRODUCT_IDS.MONITOR_ARM]: 0.2,
    [PRODUCT_IDS.NOTEBOOK_POUCH]: 0.05,
    [PRODUCT_IDS.LOFI_SPEAKER]: 0.25,
  };

  Array.from(cartItems).forEach((itemDiv) => {
    const currentItem = findProductById(itemDiv.id);
    const quantity = parseInt(itemDiv.querySelector('.quantity-number').textContent, 10);

    const itemTot = currentItem.basePrice * quantity;
    let disc = 0;
    itemCnt += quantity;
    subTot += itemTot;

    // 수량 10개 이상일 때 할인 적용
    if (quantity >= 10) {
      disc = DISCOUNT_RATES[currentItem.id] || 0;
      if (disc > 0) {
        itemDiscounts.push({ name: currentItem.name, discount: disc * 100 });
      }
    }

    // 가격 표시 스타일 업데이트
    itemDiv.querySelectorAll('.text-lg').forEach((elem) => {
      elem.style.fontWeight = quantity >= 10 ? 'bold' : 'normal';
    });

    totalAmt += itemTot * (1 - disc);
  });

  let discRate = 0;
  var originalTotal = subTot;
  if (itemCnt >= 30) {
    totalAmt = (subTot * 75) / 100;
    discRate = 25 / 100;
  } else {
    discRate = (subTot - totalAmt) / subTot;
  }
  const today = new Date();
  var isTuesday = today.getDay() === 2;
  var tuesdaySpecial = document.getElementById('tuesday-special');
  if (isTuesday) {
    if (totalAmt > 0) {
      totalAmt = (totalAmt * 90) / 100;
      discRate = 1 - totalAmt / originalTotal;
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
  document.getElementById('item-count').textContent = '🛍️ ' + itemCnt + ' items in cart';
  summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';
  if (subTot > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      var curItem;
      for (var j = 0; j < productList.length; j++) {
        if (productList[j].id === cartItems[i].id) {
          curItem = productList[j];
          break;
        }
      }
      var qtyElem = cartItems[i].querySelector('.quantity-number');
      var q = parseInt(qtyElem.textContent);
      var itemTotal = curItem.basePrice * q;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${q}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }
    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subTot.toLocaleString()}</span>
      </div>
    `;
    if (itemCnt >= 30) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(function (item) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }
    if (isTuesday) {
      if (totalAmt > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-10%</span>
          </div>
        `;
      }
    }
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
  totalDiv = sum.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = '₩' + Math.round(totalAmt).toLocaleString();
  }
  loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    points = Math.floor(totalAmt / 1000);
    if (points > 0) {
      loyaltyPointsDiv.textContent = '적립 포인트: ' + points + 'p';
      loyaltyPointsDiv.style.display = 'block';
    } else {
      loyaltyPointsDiv.textContent = '적립 포인트: 0p';
      loyaltyPointsDiv.style.display = 'block';
    }
  }
  discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';
  if (discRate > 0 && totalAmt > 0) {
    savedAmount = originalTotal - totalAmt;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }
  itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = '🛍️ ' + itemCnt + ' items in cart';
    if (previousCount !== itemCnt) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  handleStockInfoUpdate();
  doRenderBonusPoints();
}

//1차 리팩토링 완료
function onUpdateSelectOptions() {
  DOM.productSelect.innerHTML = '';

  // 코드 개선: forEach, 템플릿 리터럴, 가독성 향상, 중복 제거
  productList.forEach((item) => {
    const opt = document.createElement('option');
    opt.value = item.id;

    if (item.q === 0) {
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
  var totalCount = 0,
    j = 0;

  var cartItems;

  while (DOM.cartItemsContainer.children[j]) {
    var qty = DOM.cartItemsContainer.children[j].querySelector('.quantity-number');
    totalCount += qty ? parseInt(qty.textContent) : 0;
    j++;
  }

  totalCount = 0;
  for (j = 0; j < DOM.cartItemsContainer.children.length; j++) {
    totalCount += parseInt(
      DOM.cartItemsContainer.children[j].querySelector('.quantity-number').textContent,
    );
  }

  cartItems = DOM.cartItemsContainer.children;
  for (var i = 0; i < cartItems.length; i++) {
    var itemId = cartItems[i].id;
    var product = null;
    for (var productIdx = 0; productIdx < productList.length; productIdx++) {
      if (productList[productIdx].id === itemId) {
        product = productList[productIdx];
        break;
      }
    }
    if (product) {
      var priceDiv = cartItems[i].querySelector('.text-lg');
      var nameDiv = cartItems[i].querySelector('h3');
      if (product.onSale && product.suggestSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.basePrice.toLocaleString() +
          '</span> <span class="text-purple-600">₩' +
          product.basePrice.toLocaleString() +
          '</span>';
        nameDiv.textContent = '⚡💝' + product.name;
      } else if (product.onSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.basePrice.toLocaleString() +
          '</span> <span class="text-red-500">₩' +
          product.basePrice.toLocaleString() +
          '</span>';
        nameDiv.textContent = '⚡' + product.name;
      } else if (product.suggestSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.basePrice.toLocaleString() +
          '</span> <span class="text-blue-500">₩' +
          product.basePrice.toLocaleString() +
          '</span>';
        nameDiv.textContent = '💝' + product.name;
      } else {
        priceDiv.textContent = '₩' + product.basePrice.toLocaleString();
        nameDiv.textContent = product.name;
      }
    }
  }
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
  stockInfo = StockStatusDiv();
  selectorContainer.appendChild(stockInfo);
  leftColumn.appendChild(selectorContainer);
  DOM.cartItemsContainer = CartItemsContainer();
  leftColumn.appendChild(DOM.cartItemsContainer);
  gridContainer.appendChild(leftColumn);
  const rightColumn = OrderSummaryColumn();
  sum = rightColumn.querySelector('#cart-total');
  gridContainer.appendChild(rightColumn);
  root.appendChild(gridContainer);
  DOM.manualOverlay = ManualOverlay();
  DOM.manualColumn = ManualColumn();
  DOM.manualOverlay.appendChild(DOM.manualColumn);
  root.appendChild(DOM.manualOverlay);
  DOM.manualToggleBtn = ManualToggleButton();
  root.appendChild(DOM.manualToggleBtn);
}

function handleAddToCart() {
  const selectedProductId = DOM.productSelect.value;

  var itemToAdd = findProductById(selectedProductId);

  if (!selectedProductId || !itemToAdd) {
    return;
  }

  if (itemToAdd.q > 0) {
    var item = document.getElementById(itemToAdd.id);
    if (item) {
      var qtyElem = item.querySelector('.quantity-number');
      var newQty = parseInt(qtyElem['textContent']) + 1;
      if (newQty <= itemToAdd.q + parseInt(qtyElem.textContent)) {
        qtyElem.textContent = newQty;
        itemToAdd.q--;
      } else {
        alert(MESSAGES.QTY_ALERT);
      }
    } else {
      var newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className =
        'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${itemToAdd.onSale && itemToAdd.suggestSale ? '⚡💝' : itemToAdd.onSale ? '⚡' : itemToAdd.suggestSale ? '💝' : ''}${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.basePrice.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.basePrice.toLocaleString() + '</span>' : '₩' + itemToAdd.basePrice.toLocaleString()}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.basePrice.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.basePrice.toLocaleString() + '</span>' : '₩' + itemToAdd.basePrice.toLocaleString()}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
        </div>
      `;
      DOM.cartItemsContainer.appendChild(newItem);
      itemToAdd.q--;
    }
    handleCalculateCartStuff();
    lastSel = selectedProductId;
  }
}

//1차 리팩토링 완료
function setupEventListeners() {
  DOM.addToCartBtn.addEventListener('click', function () {
    handleAddToCart();
  });
  DOM.cartItemsContainer.addEventListener('click', function (event) {
    var tgt = event.target;
    if (tgt.classList.contains('quantity-change') || tgt.classList.contains('remove-item')) {
      var prodId = tgt.dataset.productId;
      var itemElem = document.getElementById(prodId);
      var prod = null;
      for (var prdIdx = 0; prdIdx < productList.length; prdIdx++) {
        if (productList[prdIdx].id === prodId) {
          prod = productList[prdIdx];
          break;
        }
      }
      if (tgt.classList.contains('quantity-change')) {
        var qtyChange = parseInt(tgt.dataset.change);
        var qtyElem = itemElem.querySelector('.quantity-number');
        var currentQty = parseInt(qtyElem.textContent);
        var newQty = currentQty + qtyChange;
        if (newQty > 0 && newQty <= prod.q + currentQty) {
          qtyElem.textContent = newQty;
          prod.q -= qtyChange;
        } else if (newQty <= 0) {
          prod.q += currentQty;
          itemElem.remove();
        } else {
          alert('재고가 부족합니다.');
        }
      } else if (tgt.classList.contains('remove-item')) {
        var qtyElem = itemElem.querySelector('.quantity-number');
        var remQty = parseInt(qtyElem.textContent);
        prod.q += remQty;
        itemElem.remove();
      }
      if (prod && prod.q < 5) {
      }
      handleCalculateCartStuff();
      onUpdateSelectOptions();
    }
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
  let lightningDelay = Math.random() * 10000;
  setTimeout(() => {
    setInterval(function () {
      // 번개세일 대상 상품을 무작위로 선택하되, 세일 중이 아니고 재고가 있는 상품만 대상으로 함
      const candidates = productList.filter((item) => item.q > 0 && !item.onSale);
      if (candidates.length > 0) {
        const luckyItem = candidates[Math.floor(Math.random() * candidates.length)];
        luckyItem.basePrice = Math.round(luckyItem.basePrice * 0.8);
        luckyItem.onSale = true;
        alert(`⚡번개세일! ${luckyItem.name}이(가) 20% 할인 중입니다!`);
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, 30000);
  }, lightningDelay);

  setTimeout(function () {
    setInterval(function () {
      if (lastSel) {
        var suggest = null;
        for (var k = 0; k < productList.length; k++) {
          if (productList[k].id !== lastSel) {
            if (productList[k].q > 0) {
              if (!productList[k].suggestSale) {
                suggest = productList[k];
                break;
              }
            }
          }
        }
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
  handleCalculateCartStuff();
  //할인 추천 이벤트
  activateSalesAndSuggestions();
}

init();
