import { useMemo } from 'react';
import type { MenuItem, MenuPage, MenuCategory } from '@/types';

interface UseMenuPaginationProps {
  menuItems: MenuItem[];
  itemsPerPage: number;
  maintainCategoryOrder?: boolean;
}

interface UseMenuPaginationReturn {
  pages: MenuPage[];
  totalPages: number;
  totalItems: number;
}

/**
 * Custom hook for paginating menu items
 *
 * @param menuItems - Array of menu items to paginate
 * @param itemsPerPage - Number of items per page
 * @param maintainCategoryOrder - If true, keeps categories together across pages
 * @returns Paginated menu structure with pages array
 */
export function useMenuPagination({
  menuItems,
  itemsPerPage,
  maintainCategoryOrder = true,
}: UseMenuPaginationProps): UseMenuPaginationReturn {
  const paginatedData = useMemo(() => {
    // Filter out items without images (not finalized)
    const finalizedItems = menuItems.filter(
      (item) => item.generatedImages && item.generatedImages.length > 0
    );

    // Sort by display order
    const sortedItems = [...finalizedItems].sort((a, b) => a.displayOrder - b.displayOrder);

    if (maintainCategoryOrder) {
      // Group by category first
      const categoryGroups: Record<MenuCategory, MenuItem[]> = {
        'Appetizers': [],
        'Soups': [],
        'Salads': [],
        'Mains': [],
        'Sides': [],
        'Desserts': [],
        'Beverages': [],
      };

      sortedItems.forEach((item) => {
        const category = item.category || 'Mains';
        if (categoryGroups[category]) {
          categoryGroups[category].push(item);
        }
      });

      // Paginate while keeping categories together
      const pages: MenuPage[] = [];
      let currentPage: MenuItem[] = [];
      let pageNumber = 1;

      Object.entries(categoryGroups).forEach(([_, items]) => {
        if (items.length === 0) return;

        for (const item of items) {
          currentPage.push(item);

          if (currentPage.length === itemsPerPage) {
            pages.push({
              pageNumber,
              items: currentPage,
            });
            currentPage = [];
            pageNumber++;
          }
        }
      });

      // Add remaining items as last page
      if (currentPage.length > 0) {
        pages.push({
          pageNumber,
          items: currentPage,
        });
      }

      return {
        pages,
        totalPages: pages.length,
        totalItems: sortedItems.length,
      };
    } else {
      // Simple pagination without category grouping
      const pages: MenuPage[] = [];

      for (let i = 0; i < sortedItems.length; i += itemsPerPage) {
        const pageItems = sortedItems.slice(i, i + itemsPerPage);
        pages.push({
          pageNumber: Math.floor(i / itemsPerPage) + 1,
          items: pageItems,
        });
      }

      return {
        pages,
        totalPages: pages.length,
        totalItems: sortedItems.length,
      };
    }
  }, [menuItems, itemsPerPage, maintainCategoryOrder]);

  return paginatedData;
}
