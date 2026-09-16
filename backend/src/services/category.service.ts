import type { HydratedDocument } from 'mongoose';

import { Category, type CategoryDoc } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { buildPageResult, getPaginationDefaults } from '../utils/pagination.js';
import { slugify } from '../utils/slug.js';

export interface CategoryUpsertInput {
  name?: { en: string; ar?: string };
  slug?: string;
  parent?: string | null;
  icon?: string;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export async function getCategoryById(id: string): Promise<HydratedDocument<CategoryDoc>> {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  return category;
}

export async function assertParentExists(parentId: string): Promise<void> {
  const parent = await Category.findById(parentId);
  if (!parent) {
    throw new ApiError(400, 'Parent category does not exist.');
  }
}

export async function assertNoCycle(categoryId: string, parentId: string | null): Promise<void> {
  let current: HydratedDocument<CategoryDoc> | null = null;
  if (parentId) {
    current = await Category.findById(parentId);
  }

  let depth = 0;
  while (current && depth < 10) {
    if (current._id.toString() === categoryId) {
      throw new ApiError(400, 'Category cannot be a descendant of itself.');
    }
    const nextParentId = (current.parent as string | null | undefined) ?? null;
    current = nextParentId ? await Category.findById(nextParentId) : null;
    depth += 1;
  }
}

export async function assertNoChildren(categoryId: string): Promise<void> {
  const children = await Category.countDocuments({ parent: categoryId });
  if (children > 0) {
    throw new ApiError(409, 'Cannot delete a category that has child categories.');
  }
}

export async function assertNoProducts(categoryId: string): Promise<void> {
  const products = await Product.countDocuments({ category: categoryId });
  if (products > 0) {
    throw new ApiError(409, 'Cannot delete a category that has products attached.');
  }
}

export async function resolveCategorySlug(
  inputSlug: string | undefined,
  nameEn: string,
  excludeId?: string,
): Promise<string> {
  const base = inputSlug || slugify(nameEn) || 'category';
  const filter: Record<string, unknown> = { slug: base };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Category.findOne(filter);
  return existing ? `${base}-${existing._id.toString().slice(-4)}` : base;
}

export async function createCategory(input: Required<Pick<CategoryUpsertInput, 'name'>> & CategoryUpsertInput) {
  if (input.parent) {
    await assertParentExists(input.parent);
  } else if (input.parent === undefined) {
    input.parent = null;
  }

  const category = await Category.create({
    name: input.name,
    slug: await resolveCategorySlug(input.slug, input.name.en),
    parent: input.parent ?? null,
    icon: input.icon,
    status: input.status ?? 'active',
    sortOrder: input.sortOrder ?? 0,
  });

  return category;
}

export async function updateCategory(id: string, input: CategoryUpsertInput) {
  const category = await getCategoryById(id);

  if (input.name) category.name = input.name;
  if (input.slug) category.slug = await resolveCategorySlug(input.slug, category.name.en, id);
  if (input.parent !== undefined) {
    const parent = input.parent === null ? null : input.parent;
    if (parent) {
      await assertParentExists(parent);
      await assertNoCycle(id, parent);
    }
    category.parent = parent as never;
  }
  if (input.icon !== undefined) category.icon = input.icon;
  if (input.status) category.status = input.status;
  if (input.sortOrder !== undefined) category.sortOrder = input.sortOrder;

  await category.save();
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  await assertNoChildren(id);
  await assertNoProducts(id);
  await Category.deleteOne({ _id: id });
}

export async function setCategoryStatus(id: string, status: 'active' | 'inactive') {
  const category = await getCategoryById(id);
  if (category.status === status) {
    throw new ApiError(409, `Category is already ${status}.`);
  }
  category.status = status;
  await category.save();
  return category;
}

export interface ListCategoriesParams {
  q?: string;
  parent?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface CategoryTreeNode {
  _id: string;
  name: { en: string; ar?: string };
  slug: string;
  icon?: string;
  status: string;
  sortOrder: number;
  children: CategoryTreeNode[];
}

export async function getPublicCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await Category.find({ status: 'active' })
    .select('name slug icon status sortOrder parent')
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const nodes = new Map<string, CategoryTreeNode>();
  for (const cat of categories) {
    nodes.set(cat._id.toString(), {
      _id: cat._id.toString(),
      name: { en: cat.name.en, ar: cat.name.ar ?? undefined },
      slug: cat.slug,
      icon: cat.icon ?? undefined,
      status: cat.status,
      sortOrder: cat.sortOrder,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];
  for (const cat of categories) {
    const node = nodes.get(cat._id.toString());
    if (!node) continue;

    const parentId = cat.parent ? cat.parent.toString() : null;
    const parent = parentId ? nodes.get(parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function listCategories(params: ListCategoriesParams) {
  const page = getPaginationDefaults(params.page, 1);
  const limit = Math.min(getPaginationDefaults(params.limit, 100), 100);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (params.parent) filter.parent = params.parent;
  if (params.status) filter.status = params.status;

  const q = params.q?.trim();
  if (q) filter['name.en'] = { $regex: escapeRegExp(q), $options: 'i' };

  const [docs, total] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, createdAt: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  return buildPageResult(docs, page, limit, total);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}