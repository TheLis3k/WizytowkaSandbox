package pl.app.backend.controller.open;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.app.backend.dto.menu.MenuItemResponse;
import pl.app.backend.service.interfaces.IMenuItemService;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
@RequiredArgsConstructor
public class MenuPublicController {

    private final IMenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getMenu() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }
}
