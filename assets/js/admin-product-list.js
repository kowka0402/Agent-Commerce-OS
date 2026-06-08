$(document).ready(async function () {
    let adminProducts = [];
    let currentKeyword = "";
    let currentCategory = "all";
    let currentStatus = "all";
  
    try {
      const dbProducts = await fetchProductsFromDb();
      adminProducts = createAdminProducts(dbProducts);
    } catch (error) {
      console.error("관리자 상품 조회 실패:", error);
      adminProducts = [];
    }
  
    renderAdminProducts(adminProducts);
    renderSummary(adminProducts);
    bindFilters();
  
    /**
     * Supabase products 데이터를 관리자 목록용 ViewModel로 변환
     * 현재 anon key는 public 상품 조회만 가능
     */
    function createAdminProducts(products) {
      return products.map(function (product, index) {
        return {
          ...product,
          status: product.is_public === false ? "hidden" : "public",
          createdBy: product.created_by || "Seed",
          stock: product.stock || 20 + index * 3,
          createdAt: formatDate(product.created_at)
        };
      });
    }
  
    function bindFilters() {
      $("#adminProductSearchBtn").on("click", function () {
        currentKeyword = $("#adminProductSearchInput").val().trim();
        applyFilters();
      });
  
      $("#adminProductSearchInput").on("keyup", function (event) {
        if (event.key === "Enter") {
          currentKeyword = $(this).val().trim();
          applyFilters();
        }
      });
  
      $("#adminCategoryFilter").on("change", function () {
        currentCategory = $(this).val();
        applyFilters();
      });
  
      $("#adminStatusFilter").on("change", function () {
        currentStatus = $(this).val();
        applyFilters();
      });
  
      $(document).on("click", ".status-toggle-btn", function () {
        const productId = $(this).data("product-id");
        toggleProductStatus(productId);
      });
  
      $(document).on("click", ".admin-edit-btn", function () {
        const productId = $(this).data("product-id");
  
        alert(`상품 ID ${productId} 수정 페이지는 추후 구현됩니다.`);
      });
  
      $(document).on("click", ".admin-delete-btn", function () {
        const productId = $(this).data("product-id");
        deleteProduct(productId);
      });
    }
  
    function applyFilters() {
      let filteredProducts = [...adminProducts];
  
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
  
      if (currentStatus !== "all") {
        filteredProducts = filteredProducts.filter(function (product) {
          return product.status === currentStatus;
        });
      }
  
      renderAdminProducts(filteredProducts);
      renderSummary(adminProducts);
    }
  
    function renderAdminProducts(products) {
      const $tbody = $("#adminProductTableBody");
      const $emptyState = $("#adminEmptyState");
  
      $tbody.empty();
  
      if (products.length === 0) {
        $emptyState.show();
        return;
      }
  
      $emptyState.hide();
  
      products.forEach(function (product) {
        $tbody.append(createProductRow(product));
      });
    }
  
    function createProductRow(product) {
      const formattedPrice = product.price.toLocaleString("ko-KR");
      const statusText = product.status === "public" ? "공개" : "비공개";
      const statusClass = product.status === "public" ? "is-public" : "is-hidden";
  
      return `
        <tr>
          <td>
            <div class="admin-product-cell">
              <div class="admin-product-thumb">
                ${product.categoryName}
              </div>
  
              <div>
                <strong>${product.name}</strong>
                <p>${product.description || ""}</p>
                <small>재고 ${product.stock}개 · 등록일 ${product.createdAt}</small>
              </div>
            </div>
          </td>
  
          <td>
            <span class="admin-category-badge">
              ${product.categoryName}
            </span>
          </td>
  
          <td>
            <strong>${formattedPrice}원</strong>
          </td>
  
          <td>
            <button
              type="button"
              class="status-toggle-btn ${statusClass}"
              data-product-id="${product.id}"
            >
              ${statusText}
            </button>
          </td>
  
          <td>
            <span class="created-by-badge">
              ${product.createdBy}
            </span>
          </td>
  
          <td>
            <div class="admin-action-buttons">
              <a
                href="../product-detail.html?id=${product.id}"
                target="_blank"
                class="admin-view-btn"
              >
                보기
              </a>
  
              <button
                type="button"
                class="admin-edit-btn"
                data-product-id="${product.id}"
              >
                수정
              </button>
  
              <button
                type="button"
                class="admin-delete-btn"
                data-product-id="${product.id}"
              >
                삭제
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  
    function renderSummary(products) {
      const totalCount = products.length;
  
      const publicCount = products.filter(function (product) {
        return product.status === "public";
      }).length;
  
      const hiddenCount = products.filter(function (product) {
        return product.status === "hidden";
      }).length;
  
      const aiCount = products.filter(function (product) {
        return product.createdBy === "AI Agent";
      }).length;
  
      $("#totalProductCount").text(totalCount);
      $("#publicProductCount").text(publicCount);
      $("#hiddenProductCount").text(hiddenCount);
      $("#aiProductCount").text(aiCount);
    }
  
    function toggleProductStatus(productId) {
      const product = adminProducts.find(function (item) {
        return item.id === productId;
      });
  
      if (!product) {
        return;
      }
  
      product.status = product.status === "public" ? "hidden" : "public";
  
      /**
       * TODO: 실제 DB 반영은 FastAPI service_role key로 처리
       * PATCH /api/admin/products/{id}/status
       *
       * 브라우저 anon key로 관리자 수정 API를 직접 호출하지 않는 게 안전함
       */
  
      applyFilters();
    }
  
    function deleteProduct(productId) {
      const confirmed = confirm("정말 이 상품을 삭제하시겠습니까?");
  
      if (!confirmed) {
        return;
      }
  
      adminProducts = adminProducts.filter(function (product) {
        return product.id !== productId;
      });
  
      /**
       * TODO: 실제 DB 삭제는 FastAPI service_role key로 처리
       * DELETE /api/admin/products/{id}
       */
  
      applyFilters();
      renderSummary(adminProducts);
    }
  
    function formatDate(value) {
      if (!value) {
        return "-";
      }
  
      const date = new Date(value);
  
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
    }
  });