export interface ICategory {
  id: string;
  name: string;
  description: string;
  color: string;
  parentId: string | null;
  imageUrl: string | null;
}