package pl.app.backend.service.interfaces;

import pl.app.backend.dto.category.CategoryRequest;
import pl.app.backend.dto.category.CategoryResponse;

import java.util.List;

public interface ICategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse renameCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    void reorderCategories(List<Long> ids);
}
