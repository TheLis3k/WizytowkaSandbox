package pl.app.backend.service.interfaces;

import pl.app.backend.dto.menu.MenuItemRequest;
import pl.app.backend.dto.menu.MenuItemResponse;

import java.util.List;

public interface IMenuItemService {
    List<MenuItemResponse> getAllMenuItems();
    MenuItemResponse saveMenuItem(MenuItemRequest request);
    MenuItemResponse updateMenuItem(Long id, MenuItemRequest request);
    void deleteMenuItem(Long id);
}