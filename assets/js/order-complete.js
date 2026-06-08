$(document).ready(function () {
    const order = loadLastOrder();
  
    if (!order) {
      renderEmptyOrder();
      return;
    }
  
    renderOrderInfo(order);
    renderOrderProducts(order.items);
    renderDeliveryInfo(order);
    renderPaymentSummary(order);
    renderAiNotification(order);
    bindOrderCompleteEvents(order);
  
    /**
     * TODO: FastAPI 연동 예정
     * GET /api/orders/{orderId}
     */
    function loadLastOrder() {
      const savedOrder = localStorage.getItem("lastOrder");
      return savedOrder ? JSON.parse(savedOrder) : null;
    }
  
    function renderOrderInfo(order) {
      $("#orderId").text(order.orderId);
      $("#paymentStatus").text(convertPaymentStatus(order.payment.status));
      $("#paymentMethod").text(convertPaymentMethod(order.payment.method));
      $("#orderCreatedAt").text(formatDateTime(order.createdAt));
    }
  
    function renderOrderProducts(items) {
      const $list = $("#completeProductList");
  
      $list.empty();
  
      items.forEach(function (item) {
        const itemTotalPrice = item.price * item.quantity;
  
        const productHtml = `
          <article class="complete-product-item">
            <div class="complete-product-thumb">
              ${item.categoryName}
            </div>
  
            <div class="complete-product-info">
              <strong>${item.name}</strong>
              <p>${item.description}</p>
              <small>옵션: ${item.optionName || "기본 옵션"} · 수량 ${item.quantity}개</small>
            </div>
  
            <strong class="complete-product-price">
              ${itemTotalPrice.toLocaleString("ko-KR")}원
            </strong>
          </article>
        `;
  
        $list.append(productHtml);
      });
    }
  
    function renderDeliveryInfo(order) {
      $("#receiverName").text(order.receiver.name);
      $("#receiverPhone").text(order.receiver.phone);
      $("#receiverAddress").text(`${order.receiver.address} ${order.receiver.addressDetail}`);
      $("#deliveryMemo").text(order.receiver.memo);
    }
  
    function renderPaymentSummary(order) {
      $("#summaryProductPrice").text(`${order.payment.productPrice.toLocaleString("ko-KR")}원`);
      $("#summaryShippingFee").text(`${order.payment.shippingFee.toLocaleString("ko-KR")}원`);
      $("#summaryDiscountPrice").text(`${order.payment.discountPrice.toLocaleString("ko-KR")}원`);
      $("#summaryTotalPrice").text(`${order.payment.totalPrice.toLocaleString("ko-KR")}원`);
    }
  
    function renderAiNotification(order) {
      const message = createAiNotificationMessage(order);
      $("#aiNotificationMessage").text(message);
    }
  
    function bindOrderCompleteEvents(order) {
      $("#regenerateMessageBtn").on("click", function () {
        renderAiNotification(order);
      });
    }
  
    /**
     * TODO: LLM Notification Agent 연동 예정
     * POST /api/notifications/order-complete-copy
     * request: {
     *   orderId,
     *   buyerName,
     *   productNames,
     *   categories,
     *   deliveryMemo
     * }
     */
    function createAiNotificationMessage(order) {
      const buyerName = order.buyer.name;
      const firstItem = order.items[0];
      const productCount = order.items.length;
      const productLabel = productCount > 1
        ? `${firstItem.name} 외 ${productCount - 1}건`
        : firstItem.name;
  
      const hasFreshFood = order.items.some(function (item) {
        return item.category === "fresh_food";
      });
  
      const hasAppliance = order.items.some(function (item) {
        return item.category === "small_appliance";
      });
  
      const templates = [];
  
      if (hasFreshFood) {
        templates.push(
          `${buyerName}님, 주문이 완료되었습니다.\n\n${productLabel} 상품은 신선도 유지를 위해 출고 전 선별 후 발송될 예정입니다.\n\n산지의 신선함이 잘 전달될 수 있도록 꼼꼼히 준비하겠습니다.\n\n주문번호: ${order.orderId}`
        );
  
        templates.push(
          `${buyerName}님, 감사합니다.\n\n${productLabel} 주문이 정상 접수되었습니다.\n\n신선식품 특성상 상품 상태를 확인한 뒤 안전하게 포장하여 출고하겠습니다.\n\n배송 메모: ${order.receiver.memo}`
        );
      }
  
      if (hasAppliance) {
        templates.push(
          `${buyerName}님, 주문이 완료되었습니다.\n\n${productLabel} 상품은 평균 2일 이내 출고 예정입니다.\n\n사용 공간과 목적에 맞게 만족스럽게 활용하실 수 있도록 안전하게 배송하겠습니다.\n\n주문번호: ${order.orderId}`
        );
  
        templates.push(
          `${buyerName}님, Agent-Commerce OS를 이용해주셔서 감사합니다.\n\n${productLabel} 주문이 정상 결제되었습니다.\n\n상품 수령 후 사용 전 구성품을 먼저 확인해주세요.`
        );
      }
  
      if (templates.length === 0) {
        templates.push(
          `${buyerName}님, 주문이 완료되었습니다.\n\n${productLabel} 상품을 안전하게 준비하여 발송하겠습니다.\n\n주문번호: ${order.orderId}`
        );
      }
  
      const randomIndex = Math.floor(Math.random() * templates.length);
      return templates[randomIndex];
    }
  
    function convertPaymentStatus(status) {
      if (status === "PAID_MOCK") {
        return "결제완료(Mock)";
      }
  
      return status;
    }
  
    function convertPaymentMethod(method) {
      const methodMap = {
        kakaopay: "카카오페이",
        card: "신용카드",
        tosspay: "토스페이"
      };
  
      return methodMap[method] || method;
    }
  
    function formatDateTime(isoString) {
      const date = new Date(isoString);
  
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  
    function renderEmptyOrder() {
      $("main").html(`
        <section class="complete-hero">
          <div class="container complete-hero-inner">
            <span class="complete-eyebrow">Order Not Found</span>
            <h1>주문 정보를 찾을 수 없습니다.</h1>
            <p>결제 완료 정보가 없거나 세션이 만료되었습니다.</p>
            <div style="margin-top: 24px;">
              <a href="./index.html" class="btn-primary">메인으로 돌아가기</a>
            </div>
          </div>
        </section>
      `);
    }
  });