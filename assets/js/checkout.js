$(document).ready(function () {
    let checkoutItems = loadCheckoutItems();
  
    renderCheckoutItems();
    renderSummary();
    bindCheckoutEvents();
  
    /**
     * 장바구니에서 넘어온 경우:
     * localStorage.checkoutItems
     *
     * 상세/카테고리 바로구매로 넘어온 경우:
     * checkout.html?productId=1&quantity=1
     */
    function loadCheckoutItems() {
      const params = new URLSearchParams(window.location.search);
      const productId = Number(params.get("productId"));
      const quantity = Number(params.get("quantity")) || 1;
      const optionName = params.get("option") || "기본 옵션";
  
      if (productId) {
        const product = PRODUCTS.find(function (item) {
          return item.id === productId;
        });
  
        if (!product) {
          return [];
        }
  
        return [
          {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            category: product.category,
            categoryName: product.categoryName,
            price: product.price,
            badge: product.badge,
            description: product.description,
            optionName,
            quantity,
            checked: true
          }
        ];
      }
  
      const savedCheckoutItems = localStorage.getItem("checkoutItems");
      return savedCheckoutItems ? JSON.parse(savedCheckoutItems) : [];
    }
  
    function renderCheckoutItems() {
      const $list = $("#checkoutProductList");
      const $empty = $("#checkoutEmpty");
  
      $list.empty();
  
      if (checkoutItems.length === 0) {
        $empty.show();
        $("#paymentBtn").prop("disabled", true);
        return;
      }
  
      $empty.hide();
      $("#paymentBtn").prop("disabled", false);
  
      checkoutItems.forEach(function (item) {
        $list.append(createCheckoutProductItem(item));
      });
    }
  
    function createCheckoutProductItem(item) {
      const itemTotalPrice = item.price * item.quantity;
  
      return `
        <article class="checkout-product-item">
          <div class="checkout-product-thumb">
            ${item.categoryName}
          </div>
  
          <div class="checkout-product-info">
            <strong>${item.name}</strong>
            <p>${item.description}</p>
            <small>옵션: ${item.optionName || "기본 옵션"} · 수량 ${item.quantity}개</small>
          </div>
  
          <strong class="checkout-product-price">
            ${itemTotalPrice.toLocaleString("ko-KR")}원
          </strong>
        </article>
      `;
    }
  
    function renderSummary() {
      const productPrice = checkoutItems.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
      }, 0);
  
      const shippingFee = productPrice === 0 ? 0 : 0;
      const discountPrice = calculateMockDiscount(productPrice);
      const totalPrice = productPrice + shippingFee - discountPrice;
  
      $("#summaryProductPrice").text(`${productPrice.toLocaleString("ko-KR")}원`);
      $("#summaryShippingFee").text(`${shippingFee.toLocaleString("ko-KR")}원`);
      $("#summaryDiscountPrice").text(`${discountPrice.toLocaleString("ko-KR")}원`);
      $("#summaryTotalPrice").text(`${totalPrice.toLocaleString("ko-KR")}원`);
    }
  
    function calculateMockDiscount(productPrice) {
      if (productPrice >= 100000) {
        return 3000;
      }
  
      return 0;
    }
  
    function bindCheckoutEvents() {
      $(".payment-method-card").on("click", function () {
        $(".payment-method-card").removeClass("active");
        $(this).addClass("active");
        $(this).find('input[type="radio"]').prop("checked", true);
      });
  
      $("#paymentBtn").on("click", function () {
        if (!validateOrderForm()) {
          return;
        }
  
        const order = createMockOrder();
  
        /**
         * TODO: PortOne 결제 연동 예정
         *
         * 1. 주문 생성
         * POST /api/orders
         *
         * 2. PortOne 결제 준비
         * POST /api/payments/portone/prepare
         *
         * 3. PortOne SDK 호출
         * IMP.request_pay(...)
         *
         * 4. 결제 검증
         * POST /api/payments/portone/verify
         *
         * 현재는 Mock 주문 저장 후 완료 페이지로 이동
         */
  
        localStorage.setItem("lastOrder", JSON.stringify(order));
        clearPurchasedCartItems();
        window.location.href = "./order-complete.html";
      });
    }
  
    function validateOrderForm() {
      const requiredFields = [
        {
          selector: "#buyerName",
          message: "주문자명을 입력해주세요."
        },
        {
          selector: "#buyerPhone",
          message: "주문자 연락처를 입력해주세요."
        },
        {
          selector: "#buyerEmail",
          message: "이메일을 입력해주세요."
        },
        {
          selector: "#receiverName",
          message: "받는 사람을 입력해주세요."
        },
        {
          selector: "#receiverPhone",
          message: "받는 사람 연락처를 입력해주세요."
        },
        {
          selector: "#address",
          message: "주소를 입력해주세요."
        },
        {
          selector: "#addressDetail",
          message: "상세주소를 입력해주세요."
        }
      ];
  
      for (const field of requiredFields) {
        const value = $(field.selector).val().trim();
  
        if (!value) {
          alert(field.message);
          $(field.selector).focus();
          return false;
        }
      }
  
      if (checkoutItems.length === 0) {
        alert("주문 상품이 없습니다.");
        return false;
      }
  
      return true;
    }
  
    function createMockOrder() {
      const productPrice = checkoutItems.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
      }, 0);
  
      const shippingFee = productPrice === 0 ? 0 : 0;
      const discountPrice = calculateMockDiscount(productPrice);
      const totalPrice = productPrice + shippingFee - discountPrice;
      const paymentMethod = $('input[name="paymentMethod"]:checked').val();
  
      return {
        orderId: createOrderId(),
        items: checkoutItems,
        buyer: {
          name: $("#buyerName").val().trim(),
          phone: $("#buyerPhone").val().trim(),
          email: $("#buyerEmail").val().trim()
        },
        receiver: {
          name: $("#receiverName").val().trim(),
          phone: $("#receiverPhone").val().trim(),
          address: $("#address").val().trim(),
          addressDetail: $("#addressDetail").val().trim(),
          memo: $("#deliveryMemo").val()
        },
        payment: {
          method: paymentMethod,
          productPrice,
          shippingFee,
          discountPrice,
          totalPrice,
          status: "PAID_MOCK"
        },
        createdAt: new Date().toISOString()
      };
    }
  
    function createOrderId() {
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
      const randomPart = Math.floor(Math.random() * 9000) + 1000;
  
      return `ORD-${datePart}-${randomPart}`;
    }
  
    function clearPurchasedCartItems() {
      const savedCart = localStorage.getItem("cart");
  
      if (!savedCart) {
        return;
      }
  
      const cartItems = JSON.parse(savedCart);
      const purchasedProductIds = checkoutItems.map(function (item) {
        return item.productId;
      });
  
      const remainedCartItems = cartItems.filter(function (cartItem) {
        return !purchasedProductIds.includes(cartItem.productId);
      });
  
      localStorage.setItem("cart", JSON.stringify(remainedCartItems));
      localStorage.removeItem("checkoutItems");
  
      if (typeof updateCartCountBadge === "function") {
        updateCartCountBadge();
      }
    }
  });