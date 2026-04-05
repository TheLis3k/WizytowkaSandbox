package pl.app.backend.controller.open;

import org.springframework.http.ResponseEntity;
import pl.app.backend.entity.MenuItem;
import pl.app.backend.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MenuPublicController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu() {
        List<MenuItem> items = menuItemService.getAllMenuItems();
        if (items.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204
        }
        return ResponseEntity.ok(items);
    }
}