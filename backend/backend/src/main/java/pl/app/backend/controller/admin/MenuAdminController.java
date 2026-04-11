package pl.app.backend.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.MenuItemRequest;
import pl.app.backend.dto.MenuItemResponse;
import pl.app.backend.service.interfaces.IMenuItemService;

@RestController
@RequestMapping("/api/admin/menu")
@RequiredArgsConstructor
public class MenuAdminController {

    private final IMenuItemService menuItemService;

    @PostMapping
    public ResponseEntity<MenuItemResponse> addMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemService.saveMenuItem(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuItemService.updateMenuItem(id, request));
    }
}
