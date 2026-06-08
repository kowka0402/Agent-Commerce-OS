$(document).ready(async function () {
  let productId = getProductIdFromUrl();
  let currentProduct = null;
  let uploadedImageFile = null;
  let categories = [];

  try {
    await protectAdminPage("../");

    categories = await fetchCategoriesFromDb();
    renderCategoryOptions(categories);

    currentProduct = await fetchProductByIdWithAdminAuth(productId);

    if (!currentProduct) {
      renderNotFound();
      return;
    }

    renderEditForm(currentProduct);
    bindImageChange();
    bindEditForm();
  } catch (error) {
    console.error(error);
    alert("상품 정보를 불러오지 못했습니다.");
    window.location.href = "./product-list.html";
  }

  function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function renderCategoryOptions(categories) {
    const $editCategory = $("#editCategory");

    $editCategory.empty();

    categories.forEach(function (category) {
      $editCategory.append(`
        <option value="${category.code}">
          ${category.name}
        </option>
      `);
    });
  }

  function getCategoryNameByCode(code) {
    const category = categories.find(function (item) {
      return item.code === code;
    });

    return category ? category.name : "기타";
  }

  async function fetchProductByIdWithAdminAuth(id) {
    const token = getAccessToken();

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`상품 조회 실패: ${errorText}`);
    }

    const data = await response.json();
    return data[0] ? normalizeProduct(data[0]) : null;
  }

  function renderEditForm(product) {
    $("#editProductName").val(product.name);
    $("#editCategory").val(product.category);
    $("#editPrice").val(product.price);
    $("#editBadge").val(product.badge || "");
    $("#editDescription").val(product.description || "");
    $("#editIsPublic").val(product.is_public === false ? "false" : "true");
    $("#editTags").val((product.tags || []).join(", "));

    if (product.imageUrl) {
      $("#editImagePreviewBox")
        .addClass("has-image")
        .css("background-image", `url(${product.imageUrl})`);
    }
  }

  function bindImageChange() {
    $("#editProductImageInput").on("change", function (event) {
      const file = event.target.files[0];

      if (!file) {
        return;
      }

      uploadedImageFile = file;

      const previewUrl = URL.createObjectURL(file);

      $("#editImagePreviewBox")
        .addClass("has-image")
        .css("background-image", `url(${previewUrl})`);
    });
  }

  function bindEditForm() {
    $("#productEditForm").on("submit", async function (event) {
      event.preventDefault();

      const name = $("#editProductName").val().trim();
      const category = $("#editCategory").val();
      const price = Number($("#editPrice").val());
      const badge = $("#editBadge").val().trim();
      const description = $("#editDescription").val().trim();
      const isPublic = $("#editIsPublic").val() === "true";
      const tags = parseTags($("#editTags").val());

      if (!name || !category || !price || !description) {
        alert("상품명, 카테고리, 가격, 설명은 필수입니다.");
        return;
      }

      const categoryName = getCategoryNameByCode(category);

      try {
        $("#editSubmitBtn")
          .prop("disabled", true)
          .text("저장 중...");

        let imageUrl = currentProduct.imageUrl || null;

        if (uploadedImageFile) {
          imageUrl = await uploadProductImageToStorage(uploadedImageFile);
        }

        const payload = {
          name,
          category,
          category_name: categoryName,
          price,
          badge,
          description,
          tags,
          image_url: imageUrl,
          is_public: isPublic
        };

        await updateProductToDb(productId, payload);

        alert("상품 수정이 완료되었습니다.");
        window.location.href = "./product-list.html";
      } catch (error) {
        console.error(error);
        alert("상품 수정 중 오류가 발생했습니다.");

        $("#editSubmitBtn")
          .prop("disabled", false)
          .text("상품 수정 저장");
      }
    });
  }

  function parseTags(value) {
    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map(function (tag) {
        return tag.trim().replace(/^#/, "");
      })
      .filter(Boolean);
  }

  function renderNotFound() {
    $("main").html(`
      <section class="admin-hero">
        <div class="container">
          <span class="admin-eyebrow">Not Found</span>
          <h1>상품을 찾을 수 없습니다.</h1>
          <p>삭제되었거나 존재하지 않는 상품입니다.</p>
        </div>
      </section>
    `);
  }
});