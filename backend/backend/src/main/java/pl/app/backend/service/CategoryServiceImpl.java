package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.app.backend.dto.category.CategoryRequest;
import pl.app.backend.dto.category.CategoryResponse;
import pl.app.backend.entity.Category;
import pl.app.backend.repository.CategoryRepository;
import pl.app.backend.service.interfaces.ICategoryService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements ICategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        int nextOrder = categoryRepository.findMaxSortOrder() + 1;
        Category category = Category.builder()
                .name(request.getName().trim())
                .sortOrder(nextOrder)
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse renameCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kategoria nie istnieje."));
        category.setName(request.getName().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void reorderCategories(List<Long> ids) {
        List<Category> categories = categoryRepository.findAllById(ids);
        Map<Long, Category> byId = categories.stream().collect(Collectors.toMap(Category::getId, c -> c));
        for (int i = 0; i < ids.size(); i++) {
            Category cat = byId.get(ids.get(i));
            if (cat != null) cat.setSortOrder(i);
        }
        categoryRepository.saveAll(categories);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .sortOrder(category.getSortOrder())
                .build();
    }
}
