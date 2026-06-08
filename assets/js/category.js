$(document).ready(async function () {
    let currentCategory = "all";
    let currentPrice = "all";
    let currentSort = "recommended";
    let currentKeyword = "";
    let products = [];
  
    try {
      products = await fetchProductsFromDb();
    } catch (error) {
      console.error("상품 조회 실패:", error);
      products = [];
    }
  
    initFromUrl();
    bindCategoryPageEvents();
    applyFilters();
  
    function initFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("type");
      const keyword = params.get("keyword");
  
      if (type) {
        currentCategory = type;
        $(`input[name="categoryFilter"][value="${type}"]`).prop("checked", true);
      }
  
      if (keyword) {
        currentKeyword = keyword;
      }
  
      updateHeroText();
    }
  
    function bindCategoryPageEvents() {
      $('input[name="categoryFilter"]').on("change", function () {
        currentCategory = $(this).val();
        applyFilters();
        updateHeroText();
      });
  
      $('input[name="priceFilter"]').on("change", function () {
        currentPrice = $(this).val();
        applyFilters();
      });
  
      $("#sortSelect").on("change", function () {
        currentSort = $(this).val();
        applyFilters();
      });
  
      $("#resetFilterBtn").on("click", function () {
        currentCategory = "all";
        currentPrice = "all";
        currentSort = "recommended";
        currentKeyword = "";
  
        $('input[name="categoryFilter"][value="all"]').prop("checked", true);
        $('input[name="priceFilter"][value="all"]').prop("checked", true);
        $("#sortSelect").val("recommended");
  
        window.history.replaceState({}, "", "./category.html");
  
        updateHeroText();
        applyFilters();
      });
  
      $(document).on("click", ".category-product-card", function () {
        const productId = $(this).data("product-id");
        window.location.href = `./product-detail.html?id=${productId}`;
      });
  
      $(document).on("click", ".category-cart-btn", function (event) {
        event.stopPropagation();
  
        const productId = $(this).data("product-id");
  
        const product = products.find(function (item) {
          return item.id === productId;
        });
  
        if (!product) {
          alert("상품 정보를 찾을 수 없습니다.");
          return;
        }
  
        addProductToCart(product, 1);
        openCartConfirmModal(product.name);
      });
  
      $(document).on("click", ".category-buy-btn", function (event) {
        event.stopPropagation();
  
        const productId = $(this).data("product-id");
        window.location.href = `./checkout.html?productId=${productId}&quantity=1`;
      });
    }
  
    function applyFilters() {
      let filteredProducts = [...products];
  
      if (currentKeyword) {
        filteredProducts = filteredProducts.filter(function (product) {
          const searchTarget = `
            ${product.name || ""}
            ${product.description || ""}
            ${product.categoryName || ""}
            ${product.badge || ""}
          `.toLowerCase();
  
          return searchTarget.includes(currentKeyword.toLowerCase());
        });
      }
  
      if (currentCategory !== "all") {
        filteredProducts = filteredProducts.filter(function (product) {
          return product.category === currentCategory;
        });
      }
  
      if (currentPrice !== "all") {
        filteredProducts = filteredProducts.filter(function (product) {
          return matchPriceFilter(product.price, currentPrice);
        });
      }
  
      filteredProducts = sortProducts(filteredProducts, currentSort);
  
      renderCategoryProducts(filteredProducts);
      updateResultText(filteredProducts.length);
    }
  
    function matchPriceFilter(price, filter) {
      if (filter === "under30000") {
        return price <= 30000;
      }
  
      if (filter === "30000to80000") {
        return price > 30000 && price <= 80000;
      }
  
      if (filter === "over80000") {
        return price > 80000;
      }
  
      return true;
    }
  
    function sortProducts(products, sortType) {
      const copiedProducts = [...products];
  
      if (sortType === "priceLow") {
        return copiedProducts.sort(function (a, b) {
          return a.price - b.price;
        });
      }
  
      if (sortType === "priceHigh") {
        return copiedProducts.sort(function (a, b) {
          return b.price - a.price;
        });
      }
  
      if (sortType === "name") {
        return copiedProducts.sort(function (a, b) {
          return a.name.localeCompare(b.name, "ko-KR");
        });
      }
  
      return copiedProducts;
    }
  
    function renderCategoryProducts(products) {
      const $grid = $("#categoryProductGrid");
      const $empty = $("#categoryEmpty");
  
      $grid.empty();
  
      if (products.length === 0) {
        $empty.show();
        return;
      }
  
      $empty.hide();
  
      products.forEach(function (product) {
        $grid.append(createCategoryProductCard(product));
      });
    }
  
    function createCategoryProductCard(product) {
      const formattedPrice = product.price.toLocaleString("ko-KR");
  
      return `
        <article 
          class="category-product-card"
          data-product-id="${product.id}"
        >
          <div class="category-product-img">
            ${
                product.imageUrl
                ? `<img src="${product.imageUrl}" alt="${product.name}" />`
                : product.categoryName
            }
          </div>
  
          <div class="category-product-info">
            <span class="category-product-badge">
              ${product.badge || "추천"}
            </span>
  
            <h3>${product.name}</h3>
  
            <p>${product.description || ""}</p>
  
            <strong class="category-product-price">
              ${formattedPrice}원
            </strong>
  
            <div class="category-product-actions">
              <button
                type="button"
                class="category-cart-btn"
                data-product-id="${product.id}"
              >
                장바구니
              </button>
  
              <button
                type="button"
                class="category-buy-btn"
                data-product-id="${product.id}"
              >
                바로구매
              </button>
            </div>
          </div>
        </article>
      `;
    }
  
    function updateHeroText() {
      if (currentKeyword) {
        $("#categoryEyebrow").text("Search Result");
        $("#categoryTitle").text(`"${currentKeyword}" 검색 결과`);
        $("#categoryDescription").text(
          "헤더 검색창에서 입력한 키워드를 기준으로 상품명, 설명, 카테고리 데이터를 검색합니다."
        );
        $("#resultKeywordText").text(`검색어: ${currentKeyword}`);
        return;
      }
  
      if (currentCategory === "small_appliance") {
        $("#categoryEyebrow").text("Small Appliance");
        $("#categoryTitle").text("소형가전");
        $("#categoryDescription").text(
          "1인 가구, 원룸, 계절 수요에 적합한 소형가전 상품 목록입니다."
        );
        $("#resultKeywordText").text("소형가전 카테고리 상품을 표시합니다.");
        return;
      }
  
      if (currentCategory === "fresh_food") {
        $("#categoryEyebrow").text("Fresh Food");
        $("#categoryTitle").text("신선식품");
        $("#categoryDescription").text(
          "산지, 신선도, 시즌성 중심의 1차 신선식품 상품 목록입니다."
        );
        $("#resultKeywordText").text("신선식품 카테고리 상품을 표시합니다.");
        return;
      }
  
      $("#categoryEyebrow").text("Product Search");
      $("#categoryTitle").text("전체 상품");
      $("#categoryDescription").text(
        "Agent-Commerce OS에 등록된 상품을 카테고리와 검색 조건에 따라 확인합니다."
      );
      $("#resultKeywordText").text("전체 상품을 표시합니다.");
    }
  
    function updateResultText(count) {
      $("#resultCount").text(`${count}개 상품`);
  
      if (currentKeyword) {
        $("#resultKeywordText").text(`검색어: ${currentKeyword}`);
        return;
      }
  
      if (currentCategory === "small_appliance") {
        $("#resultKeywordText").text("소형가전 카테고리 상품을 표시합니다.");
        return;
      }
  
      if (currentCategory === "fresh_food") {
        $("#resultKeywordText").text("신선식품 카테고리 상품을 표시합니다.");
        return;
      }
  
      $("#resultKeywordText").text("전체 상품을 표시합니다.");
    }
  });