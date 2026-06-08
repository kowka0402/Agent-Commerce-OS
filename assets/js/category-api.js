function normalizeCategory(category) {
    return {
      ...category,
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      sortOrder: category.sort_order,
      isActive: category.is_active
    };
  }
  
  async function fetchCategoriesFromDb() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?select=*&is_active=eq.true&order=sort_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`카테고리 조회 실패: ${errorText}`);
    }
  
    const data = await response.json();
    return data.map(normalizeCategory);
  }
  
  async function fetchAdminCategoriesFromDb() {
    const token = getAccessToken();
  
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?select=*&order=sort_order.asc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`
        }
      }
    );
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`관리자 카테고리 조회 실패: ${errorText}`);
    }
  
    const data = await response.json();
    return data.map(normalizeCategory);
  }
  
  async function insertCategoryToDb(category) {
    const token = getAccessToken();
  
    const response = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(category)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`카테고리 등록 실패: ${errorText}`);
    }
  
    const data = await response.json();
    return normalizeCategory(data[0]);
  }
  
  async function updateCategoryToDb(categoryId, category) {
    const token = getAccessToken();
  
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?id=eq.${categoryId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(category)
      }
    );
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`카테고리 수정 실패: ${errorText}`);
    }
  
    const data = await response.json();
    return normalizeCategory(data[0]);
  }
  
  async function deleteCategoryFromDb(categoryId) {
    const token = getAccessToken();
  
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/categories?id=eq.${categoryId}&select=id`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: "return=representation"
        }
      }
    );
  
    const responseText = await response.text();
  
    if (!response.ok) {
      throw new Error(`카테고리 삭제 실패: ${responseText}`);
    }
  
    const data = responseText ? JSON.parse(responseText) : [];
  
    if (!data || data.length === 0) {
      throw new Error("DB에서 삭제된 카테고리가 없습니다.");
    }
  
    return data[0];
  }