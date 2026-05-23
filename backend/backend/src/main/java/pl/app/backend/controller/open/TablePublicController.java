package pl.app.backend.controller.open;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.app.backend.dto.table.TableResponse;
import pl.app.backend.service.interfaces.IRestaurantTableService;

import java.util.List;

@RestController
@RequestMapping("/api/public/tables")
@RequiredArgsConstructor
public class TablePublicController {

    private final IRestaurantTableService tableService;

    @GetMapping
    public ResponseEntity<List<TableResponse>> getActiveTables() {
        return ResponseEntity.ok(tableService.getActiveTables());
    }
}
