$(document).ready(async function () {
    const productId = getProductIdFromUrl();
  
    let product = null;
  
    try {
      product = await fetchProductByIdFromDb(productId);
    } catch (error) {
      console.error("상품 상세 조회 실패:", error);
    }
  
    if (!product) {
      renderNotFound();
      return;
    }
  
    renderProductDetail(product);
    bindQuantityEvents(product);
    bindOptionEvent(product);
    bindDetailActionEvents(product);
    bindTabEvents();
    bindMobilePurchaseSheet(product);
  
    function getProductIdFromUrl() {
      const params = new URLSearchParams(window.location.search);
      return params.get("id");
    }
  
    function renderProductDetail(product) {
      const marketPrice = calculateMarketPrice(product.price);
      const discountRate = calculateDiscountRate(product.price, marketPrice);
  
      if (product.imageUrl) {
        $("#productImage").html(`<img src="${product.imageUrl}" alt="${product.name}" />`);
      } else {
        $("#productImage").text(product.categoryName);
      }
      $("#productName").text(product.name);
      $("#marketPrice").text(`${marketPrice.toLocaleString("ko-KR")}원`);
      $("#discountRate").text(`${discountRate}%`);
      $("#productPrice").text(`${product.price.toLocaleString("ko-KR")}원`);
      $("#productCategory").text(product.categoryName);
  
      $("#detailImageTitle").text(product.name);
      $("#detailImageDescription").text(createDetailDescription(product));
  
      $("#mobileSheetProductName").text(product.name);
  
      renderOption(product, "#productOption");
      renderOption(product, "#mobileProductOption");
  
      renderSpecTable(createMockSpecs(product));
  
      updateTotalPrice(product.price);
      updateMobileTotalPrice(product.price);
    }
  
    function calculateMarketPrice(price) {
      return Math.round((price * 1.35) / 1000) * 1000;
    }
  
    function calculateDiscountRate(salePrice, marketPrice) {
      return Math.round(((marketPrice - salePrice) / marketPrice) * 100);
    }
  
    function renderOption(product, selector) {
      const $option = $(selector);
  
      $option.empty();
      $option.append(`<option value="">-[필수] 옵션을 선택해 주세요-</option>`);
  
      if (product.category === "small_appliance") {
        $option.append(`<option value="basic">기본형</option>`);
        $option.append(`<option value="premium">프리미엄형 (+20,000원)</option>`);
      } else if (product.category === "fresh_food") {
        $option.append(`<option value="basic">기본 구성</option>`);
        $option.append(`<option value="gift">선물 포장 (+3,000원)</option>`);
      } else {
        $option.append(`<option value="basic">기본 옵션</option>`);
      }
    }
  
    function getOptionExtraPrice(selector) {
      const selectedOption = $(selector).val();
  
      if (selectedOption === "premium") {
        return 20000;
      }
  
      if (selectedOption === "gift") {
        return 3000;
      }
  
      return 0;
    }
  
    function getQuantity(selector) {
      const quantity = Number($(selector).val());
  
      if (!quantity || quantity < 1) {
        return 1;
      }
  
      return quantity;
    }
  
    function updateTotalPrice(basePrice) {
      const quantity = getQuantity("#quantityInput");
      const optionExtraPrice = getOptionExtraPrice("#productOption");
      const totalPrice = (basePrice + optionExtraPrice) * quantity;
  
      $("#totalPrice").text(`${totalPrice.toLocaleString("ko-KR")}원`);
    }
  
    function updateMobileTotalPrice(basePrice) {
      const quantity = getQuantity("#mobileQuantityInput");
      const optionExtraPrice = getOptionExtraPrice("#mobileProductOption");
      const totalPrice = (basePrice + optionExtraPrice) * quantity;
  
      $("#mobileTotalPrice").text(`${totalPrice.toLocaleString("ko-KR")}원`);
    }
  
    function bindQuantityEvents(product) {
      $("#decreaseQtyBtn").on("click", function () {
        const currentQty = getQuantity("#quantityInput");
  
        if (currentQty <= 1) {
          return;
        }
  
        $("#quantityInput").val(currentQty - 1);
        updateTotalPrice(product.price);
      });
  
      $("#increaseQtyBtn").on("click", function () {
        const currentQty = getQuantity("#quantityInput");
  
        $("#quantityInput").val(currentQty + 1);
        updateTotalPrice(product.price);
      });
  
      $("#quantityInput").on("change keyup", function () {
        const quantity = Number($(this).val());
  
        if (!quantity || quantity < 1) {
          $(this).val(1);
        }
  
        updateTotalPrice(product.price);
      });
    }
  
    function bindOptionEvent(product) {
      $("#productOption").on("change", function () {
        updateTotalPrice(product.price);
      });
    }
  
    function bindDetailActionEvents(product) {
      $("#addCartBtn").on("click", function () {
        if (!validateRequiredOption("#productOption")) {
          return;
        }
  
        const quantity = getQuantity("#quantityInput");
        const optionName = $("#productOption option:selected").text();
  
        addProductToCart(product, quantity, optionName);
        openCartConfirmModal(product.name);
      });
  
      $("#buyNowBtn").on("click", function () {
        if (!validateRequiredOption("#productOption")) {
          return;
        }
  
        const quantity = getQuantity("#quantityInput");
        const option = $("#productOption").val();
  
        window.location.href =
          `./checkout.html?productId=${product.id}&option=${option}&quantity=${quantity}`;
      });
  
      $("#askAiBtn").on("click", function () {
        $("#openChatbotBtn").trigger("click");
  
        setTimeout(function () {
          $("#chatbotInput").val(`${product.name} 장단점과 추천 대상을 알려줘`);
          $("#chatbotInput").focus();
        }, 200);
      });
  
      $(".thumbnail").on("click", function () {
        $(".thumbnail").removeClass("active");
        $(this).addClass("active");
  
        const index = $(this).index() + 1;
        $("#productImage").text(`${product.categoryName} 이미지 ${index}`);
      });
    }
  
    function bindMobilePurchaseSheet(product) {
      $("#openMobilePurchaseBtn, #openMobileCartBtn").on("click", function () {
        openMobileSheet();
      });
  
      $("#closeMobileSheetBtn, #mobileSheetDim").on("click", function () {
        closeMobileSheet();
      });
  
      $("#mobileProductOption").on("change", function () {
        updateMobileTotalPrice(product.price);
      });
  
      $("#mobileDecreaseQtyBtn").on("click", function () {
        const currentQty = getQuantity("#mobileQuantityInput");
  
        if (currentQty <= 1) {
          return;
        }
  
        $("#mobileQuantityInput").val(currentQty - 1);
        updateMobileTotalPrice(product.price);
      });
  
      $("#mobileIncreaseQtyBtn").on("click", function () {
        const currentQty = getQuantity("#mobileQuantityInput");
  
        $("#mobileQuantityInput").val(currentQty + 1);
        updateMobileTotalPrice(product.price);
      });
  
      $("#mobileQuantityInput").on("change keyup", function () {
        const quantity = Number($(this).val());
  
        if (!quantity || quantity < 1) {
          $(this).val(1);
        }
  
        updateMobileTotalPrice(product.price);
      });
  
      $("#mobileAddCartBtn").on("click", function () {
        if (!validateRequiredOption("#mobileProductOption")) {
          return;
        }
  
        const quantity = getQuantity("#mobileQuantityInput");
        const optionName = $("#mobileProductOption option:selected").text();
  
        addProductToCart(product, quantity, optionName);
        openCartConfirmModal(product.name);
        closeMobileSheet();
      });
  
      $("#mobileBuyNowBtn").on("click", function () {
        if (!validateRequiredOption("#mobileProductOption")) {
          return;
        }
  
        const quantity = getQuantity("#mobileQuantityInput");
        const option = $("#mobileProductOption").val();
  
        window.location.href =
          `./checkout.html?productId=${product.id}&option=${option}&quantity=${quantity}`;
      });
    }
  
    function openMobileSheet() {
      $("#mobileSheetDim").addClass("is-open");
      $("#mobilePurchaseSheet").addClass("is-open");
      $("body").css("overflow", "hidden");
    }
  
    function closeMobileSheet() {
      $("#mobileSheetDim").removeClass("is-open");
      $("#mobilePurchaseSheet").removeClass("is-open");
      $("body").css("overflow", "");
    }
  
    function validateRequiredOption(selector) {
      const selectedOption = $(selector).val();
  
      if (!selectedOption) {
        alert("옵션을 선택해주세요.");
        $(selector).focus();
        return false;
      }
  
      return true;
    }
  
    function bindTabEvents() {
      $(".detail-tabs a").on("click", function () {
        $(".detail-tabs a").removeClass("active");
        $(this).addClass("active");
      });
  
      $(window).on("scroll", function () {
        const scrollTop = $(window).scrollTop();
  
        const sections = [
          { id: "detailInfo", selector: '.detail-tabs a[href="#detailInfo"]' },
          { id: "reviews", selector: '.detail-tabs a[href="#reviews"]' },
          { id: "qna", selector: '.detail-tabs a[href="#qna"]' },
          { id: "deliveryInfo", selector: '.detail-tabs a[href="#deliveryInfo"]' }
        ];
  
        sections.forEach(function (section) {
          const $section = $("#" + section.id);
  
          if (!$section.length) {
            return;
          }
  
          const offsetTop = $section.offset().top - 120;
          const offsetBottom = offsetTop + $section.outerHeight();
  
          if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
            $(".detail-tabs a").removeClass("active");
            $(section.selector).addClass("active");
          }
        });
      });
    }
  
    function createDetailDescription(product) {
      if (product.category === "small_appliance") {
        return `${product.name}은 실사용 목적, 공간 효율, 가격 경쟁력을 기준으로 구성된 소형가전 상품입니다. 추후 이 영역에는 실제 상세 이미지, 기능 설명, 사용 장면, AI 생성 카피가 들어갑니다.`;
      }
  
      if (product.category === "fresh_food") {
        return `${product.name}은 산지, 신선도, 시즌성을 강조해야 하는 신선식품 상품입니다. 추후 이 영역에는 산지 이미지, 보관 방법, 배송 안내, AI 생성 상세 카피가 들어갑니다.`;
      }
  
      return "추후 이 영역에는 실제 상세 이미지와 상품 설명이 들어갑니다.";
    }
  
    function createMockSpecs(product) {
      const specJson = product.spec_json || product.specJson || {};
  
      if (Object.keys(specJson).length > 0) {
        return {
          ...specJson,
          "AI 검색 키워드": `${product.name}, ${product.categoryName}, ${product.badge || ""}`
        };
      }
  
      if (product.category === "small_appliance") {
        return {
          "상품 유형": product.categoryName,
          "권장 사용자": "1인 가구 / 원룸 / 소형 공간",
          "주요 특징": product.badge || "추천",
          "소비전력": product.name.includes("제습기") ? "180W" : "상품별 상이",
          "배송 형태": "택배 배송",
          "AI 검색 키워드": `${product.name}, ${product.categoryName}, ${product.badge || ""}`
        };
      }
  
      if (product.category === "fresh_food") {
        return {
          "상품 유형": product.categoryName,
          "보관 방식": "냉장 보관 권장",
          "주요 특징": product.badge || "추천",
          "출고 방식": "산지 또는 물류센터 직송",
          "소비 기한": "상품별 상이",
          "AI 검색 키워드": `${product.name}, ${product.categoryName}, ${product.badge || ""}`
        };
      }
  
      return {
        "상품 유형": product.categoryName,
        "주요 특징": product.badge || "추천"
      };
    }
  
    function renderSpecTable(specs) {
      const $specTable = $("#specTable");
  
      if (!$specTable.length) {
        return;
      }
  
      $specTable.empty();
  
      Object.keys(specs).forEach(function (key) {
        const row = `
          <div class="spec-row">
            <div class="spec-key">${key}</div>
            <div class="spec-value">${specs[key]}</div>
          </div>
        `;
  
        $specTable.append(row);
      });
    }
  
    function renderNotFound() {
      $("main").html(`
        <section class="product-top-section">
          <div class="container">
            <div class="not-found-box">
              <h1>상품을 찾을 수 없습니다.</h1>
              <p>잘못된 상품 ID이거나 DB에 없는 상품입니다.</p>
              <a href="./index.html" class="btn-primary">메인으로 돌아가기</a>
            </div>
          </div>
        </section>
      `);
    }
  });