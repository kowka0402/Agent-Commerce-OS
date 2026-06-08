$(document).ready(function () {
    let cartItems = loadCart();
  
    renderCart();
    bindCartEvents();
  
    /**
     * 현재는 localStorage Mock 장바구니
     * 추후 GET /api/cart 로 교체
     */
    function loadCart() {
      const savedCart = localStorage.getItem("cart");
  
      if (savedCart) {
        return JSON.parse(savedCart);
      }
  
      return [];
    }
  
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCountBadge();
}
  
    function renderCart() {
      const $cartList = $("#cartList");
      const $cartEmpty = $("#cartEmpty");
  
      $cartList.empty();
  
      if (cartItems.length === 0) {
        $cartEmpty.show();
        $("#selectAllCheckbox").prop("checked", false);
        updateSummary();
        return;
      }
  
      $cartEmpty.hide();
  
      cartItems.forEach(function (item) {
        $cartList.append(createCartItem(item));
      });
  
      updateSummary();
    }
  
    function createCartItem(item) {
      const itemTotalPrice = item.price * item.quantity;
  
      return `
        <article class="cart-item" data-cart-id="${item.id}">
          <input
            type="checkbox"
            class="cart-item-checkbox"
            data-cart-id="${item.id}"
            ${item.checked ? "checked" : ""}
          />
  
          <div class="cart-thumb">
            ${item.categoryName}
          </div>
  
          <div class="cart-info">
            <strong>${item.name}</strong>
            <p>${item.description}</p>
            <small>옵션: ${item.optionName || "기본 옵션"}</small>
          </div>
  
          <div class="cart-quantity-control">
            <button type="button" class="cart-qty-minus" data-cart-id="${item.id}">-</button>
            <input type="number" class="cart-qty-input" data-cart-id="${item.id}" value="${item.quantity}" min="1" />
            <button type="button" class="cart-qty-plus" data-cart-id="${item.id}">+</button>
          </div>
  
          <strong class="cart-price">
            ${itemTotalPrice.toLocaleString("ko-KR")}원
          </strong>
  
          <button type="button" class="cart-remove-btn" data-cart-id="${item.id}">
            삭제
          </button>
        </article>
      `;
    }
  
    function bindCartEvents() {
      $("#selectAllCheckbox").on("change", function () {
        const checked = $(this).is(":checked");
  
        cartItems = cartItems.map(function (item) {
          return {
            ...item,
            checked
          };
        });
  
        saveCart();
        renderCart();
      });
  
      $(document).on("change", ".cart-item-checkbox", function () {
        const cartId = Number($(this).data("cart-id"));
        const checked = $(this).is(":checked");
  
        cartItems = cartItems.map(function (item) {
          if (item.id === cartId) {
            return {
              ...item,
              checked
            };
          }
  
          return item;
        });
  
        saveCart();
        updateSelectAllState();
        updateSummary();
      });
  
      $(document).on("click", ".cart-qty-minus", function () {
        const cartId = Number($(this).data("cart-id"));
        changeQuantity(cartId, -1);
      });
  
      $(document).on("click", ".cart-qty-plus", function () {
        const cartId = Number($(this).data("cart-id"));
        changeQuantity(cartId, 1);
      });
  
      $(document).on("change", ".cart-qty-input", function () {
        const cartId = Number($(this).data("cart-id"));
        const quantity = Number($(this).val());
  
        setQuantity(cartId, quantity);
      });
  
      $(document).on("click", ".cart-remove-btn", function () {
        const cartId = Number($(this).data("cart-id"));
        removeCartItem(cartId);
      });
  
      $("#deleteSelectedBtn").on("click", function () {
        deleteSelectedItems();
      });
  
      $("#checkoutBtn").on("click", function () {
        const selectedItems = cartItems.filter(function (item) {
          return item.checked;
        });
  
        if (selectedItems.length === 0) {
          alert("주문할 상품을 선택해주세요.");
          return;
        }
  
        localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
        window.location.href = "./checkout.html";
      });
    }
  
    function changeQuantity(cartId, diff) {
      cartItems = cartItems.map(function (item) {
        if (item.id !== cartId) {
          return item;
        }
  
        const nextQuantity = Math.max(1, item.quantity + diff);
  
        return {
          ...item,
          quantity: nextQuantity
        };
      });
  
      saveCart();
      renderCart();
    }
  
    function setQuantity(cartId, quantity) {
      const safeQuantity = !quantity || quantity < 1 ? 1 : quantity;
  
      cartItems = cartItems.map(function (item) {
        if (item.id !== cartId) {
          return item;
        }
  
        return {
          ...item,
          quantity: safeQuantity
        };
      });
  
      saveCart();
      renderCart();
    }
  
    function removeCartItem(cartId) {
      cartItems = cartItems.filter(function (item) {
        return item.id !== cartId;
      });
  
      saveCart();
      renderCart();
    }
  
    function deleteSelectedItems() {
      const hasSelectedItem = cartItems.some(function (item) {
        return item.checked;
      });
  
      if (!hasSelectedItem) {
        alert("삭제할 상품을 선택해주세요.");
        return;
      }
  
      cartItems = cartItems.filter(function (item) {
        return !item.checked;
      });
  
      saveCart();
      renderCart();
    }
  
    function updateSelectAllState() {
      const allChecked = cartItems.length > 0 && cartItems.every(function (item) {
        return item.checked;
      });
  
      $("#selectAllCheckbox").prop("checked", allChecked);
    }
  
    function updateSummary() {
      const selectedItems = cartItems.filter(function (item) {
        return item.checked;
      });
  
      const productPrice = selectedItems.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
      }, 0);
  
      const shippingFee = productPrice === 0 ? 0 : 0;
      const totalPrice = productPrice + shippingFee;
  
      $("#summaryProductPrice").text(`${productPrice.toLocaleString("ko-KR")}원`);
      $("#summaryShippingFee").text(`${shippingFee.toLocaleString("ko-KR")}원`);
      $("#summaryTotalPrice").text(`${totalPrice.toLocaleString("ko-KR")}원`);
  
      $("#checkoutBtn").prop("disabled", selectedItems.length === 0);
      updateSelectAllState();
    }
  });