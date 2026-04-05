package pl.app.backend.controller.open;

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
    public List<MenuItem> getMenu() {
        return menuItemService.getAllMenuItems();
    }
}