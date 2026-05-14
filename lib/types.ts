// ── Hierarchical Category Types ──

export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
  sub_categories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  main_category_id: string;
  name: string;
  slug: string;
  is_composable: boolean;
  display_order: number;
  created_at?: string;
  main_category?: MainCategory;
}

// ── Raw Material Types ──

export interface RawMaterial {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_visible: boolean;
  created_at?: string;
}

export interface SubCategoryMaterial {
  sub_category_id: string;
  raw_material_id: string;
  sub_category?: SubCategory;
  raw_material?: RawMaterial;
}

// ── Extended Product Types ──

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_visible?: boolean;
  sub_category_id?: string;
  created_at?: string;
}

export interface ProductWithCategory extends Product {
  sub_category?: SubCategory & {
    main_category?: MainCategory;
  };
}

// ── Composer Order Types ──

export interface ComposerSelection {
  sub_category_id: string;
  sub_category_name: string;
  materials: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}
