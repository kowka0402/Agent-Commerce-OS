async function fetchProductsFromDb() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&is_public=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
  
    if (!response.ok) {
      throw new Error("상품 데이터를 불러오지 못했습니다.");
    }
  
    return await response.json();
  }
  
  async function fetchProductByIdFromDb(id) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${id}&select=*&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
  
    if (!response.ok) {
      throw new Error("상품 상세 데이터를 불러오지 못했습니다.");
    }
  
    const data = await response.json();
    return data[0] || null;
  }

  async function insertProductToDb(product) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(product)
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`상품 등록 실패: ${errorText}`);
    }
  
    const data = await response.json();
    return data[0];
  }