package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.app.backend.dto.MenuItemRequest;
import pl.app.backend.dto.MenuItemResponse;
import pl.app.backend.entity.MenuItem;
import pl.app.backend.repository.MenuItemRepository;
import pl.app.backend.security.InputSanitizer;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final InputSanitizer inputSanitizer;

    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MenuItemResponse saveMenuItem(MenuItemRequest request) {
        MenuItem entity = MenuItem.builder()
                .name(inputSanitizer.sanitize(request.getName()))
                .description(inputSanitizer.sanitize(request.getDescription()))
                .price(request.getPrice())
                .imageUrl(inputSanitizer.sanitize(request.getImageUrl()))
                .category(inputSanitizer.sanitize(request.getCategory()))
                .build();
        return toResponse(menuItemRepository.save(entity));
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Danie o podanym ID (" + id + ") nie istnieje."));

        item.setName(inputSanitizer.sanitize(request.getName()));
        item.setDescription(inputSanitizer.sanitize(request.getDescription()));
        item.setPrice(request.getPrice());
        item.setImageUrl(inputSanitizer.sanitize(request.getImageUrl()));
        item.setCategory(inputSanitizer.sanitize(request.getCategory()));

        return toResponse(menuItemRepository.save(item));
    }

    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }

    private MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .category(item.getCategory())
                .build();
    }
}
