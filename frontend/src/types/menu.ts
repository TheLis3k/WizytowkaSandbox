export interface CategoryResponse {
  id: number;
  name: string;
  sortOrder: number;
}

export interface MenuItemResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
}

export interface MenuItemRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
}