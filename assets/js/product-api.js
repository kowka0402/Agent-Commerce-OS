function normalizeProduct(product) {
    return {
      ...product,
      categoryName: product.category_name,
      imageUrl: product.image_url
    };
  }
  
  async function fetchProductsFromDb() {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&is_public=eq.true&order=created_at.asc`,
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
  
    const data = await response.json();
    return data.map(normalizeProduct);
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
    return data[0] ? normalizeProduct(data[0]) : null;
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
    return normalizeProduct(data[0]);
  }
  
  async function uploadProductImageToStorage(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;
  
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/product-images/${filePath}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": file.type,
          "x-upsert": "true"
        },
        body: file
      }
    );
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`이미지 업로드 실패: ${errorText}`);
    }
  
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;
  }