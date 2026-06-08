$(document).ready(async function () {
    let categories = [];
  
    try {
      await protectAdminPage("../");
      categories = await fetchAdminCategoriesFromDb();
    } catch (error) {
      console.error(error);
      categories = [];
    }
  
    renderCategories(categories);
    bindCategoryEvents();
  
    function bindCategoryEvents() {
      $("#categoryForm").on("submit", async function (event) {
        event.preventDefault();
  
        const categoryId = $("#categoryIdInput").val();
        const code = $("#categoryCodeInput").val().trim();
        const name = $("#categoryNameInput").val().trim();
        const description = $("#categoryDescriptionInput").val().trim();
        const sortOrder = Number($("#categorySortInput").val()) || 0;
        const isActive = $("#categoryActiveInput").val() === "true";
  
        if (!code || !name) {
          alert("카테고리 코드와 카테고리명을 입력해주세요.");
          return;
        }
  
        const payload = {
          code,
          name,
          description,
          sort_order: sortOrder,
          is_active: isActive
        };
  
        try {
          $("#categorySubmitBtn")
            .prop("disabled", true)
            .text("저장 중...");
  
          if (categoryId) {
            await updateCategoryToDb(categoryId, payload);
            alert("카테고리가 수정되었습니다.");
          } else {
            await insertCategoryToDb(payload);
            alert("카테고리가 등록되었습니다.");
          }
  
          categories = await fetchAdminCategoriesFromDb();
          renderCategories(categories);
          resetForm();
        } catch (error) {
          console.error(error);
          alert(error.message || "카테고리 저장 중 오류가 발생했습니다.");
        } finally {
          $("#categorySubmitBtn")
            .prop("disabled", false)
            .text("카테고리 저장");
        }
      });
  
      $("#categoryResetBtn").on("click", function () {
        resetForm();
      });
  
      $(document).on("click", ".category-edit-btn", function () {
        const categoryId = $(this).data("category-id");
  
        const category = categories.find(function (item) {
          return item.id === categoryId;
        });
  
        if (!category) {
          return;
        }
  
        $("#categoryIdInput").val(category.id);
        $("#categoryCodeInput").val(category.code).prop("disabled", true);
        $("#categoryNameInput").val(category.name);
        $("#categoryDescriptionInput").val(category.description || "");
        $("#categorySortInput").val(category.sortOrder || 0);
        $("#categoryActiveInput").val(category.isActive ? "true" : "false");
        $("#categorySubmitBtn").text("카테고리 수정 저장");
  
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
  
      $(document).on("click", ".category-delete-btn", async function () {
        const categoryId = $(this).data("category-id");
  
        const confirmed = confirm("정말 이 카테고리를 삭제하시겠습니까? 상품이 사용 중이면 오류가 날 수 있습니다.");
  
        if (!confirmed) {
          return;
        }
  
        try {
          await deleteCategoryFromDb(categoryId);
  
          categories = await fetchAdminCategoriesFromDb();
          renderCategories(categories);
  
          alert("카테고리가 삭제되었습니다.");
        } catch (error) {
          console.error(error);
          alert(error.message || "카테고리 삭제 중 오류가 발생했습니다.");
        }
      });
    }
  
    function renderCategories(categories) {
      const $tbody = $("#categoryTableBody");
      const $empty = $("#categoryEmptyState");
  
      $tbody.empty();
  
      if (categories.length === 0) {
        $empty.show();
        return;
      }
  
      $empty.hide();
  
      categories.forEach(function (category) {
        $tbody.append(createCategoryRow(category));
      });
    }
  
    function createCategoryRow(category) {
      const statusText = category.isActive ? "활성" : "비활성";
      const statusClass = category.isActive ? "is-public" : "is-hidden";
  
      return `
        <tr>
          <td>
            <strong>${category.name}</strong>
            <p>${category.description || ""}</p>
          </td>
  
          <td>
            <code>${category.code}</code>
          </td>
  
          <td>
            ${category.sortOrder}
          </td>
  
          <td>
            <span class="status-toggle-btn ${statusClass}">
              ${statusText}
            </span>
          </td>
  
          <td>
            <div class="admin-action-buttons">
              <button
                type="button"
                class="admin-edit-btn category-edit-btn"
                data-category-id="${category.id}"
              >
                수정
              </button>
  
              <button
                type="button"
                class="admin-delete-btn category-delete-btn"
                data-category-id="${category.id}"
              >
                삭제
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  
    function resetForm() {
      $("#categoryIdInput").val("");
      $("#categoryCodeInput").val("").prop("disabled", false);
      $("#categoryNameInput").val("");
      $("#categoryDescriptionInput").val("");
      $("#categorySortInput").val("10");
      $("#categoryActiveInput").val("true");
      $("#categorySubmitBtn").text("카테고리 저장");
    }
  });