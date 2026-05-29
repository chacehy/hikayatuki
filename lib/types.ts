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
  image_url?: string;
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
  detailed_description?: string;
  care_instructions?: string;
  flower_type?: string;
  sizes?: string;
  tag_label?: string | null;
  tag_bg_color?: string | null;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order?: number;
  created_at?: string;
}

export interface ProductWithCategory extends Product {
  sub_category?: SubCategory & {
    main_category?: MainCategory;
  };
  product_images?: ProductImage[];
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
