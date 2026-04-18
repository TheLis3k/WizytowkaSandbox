package pl.app.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import pl.app.backend.dto.table.TableRequest;
import pl.app.backend.dto.table.TableResponse;
import pl.app.backend.entity.RestaurantTable;
import pl.app.backend.repository.RestaurantTableRepository;
import pl.app.backend.service.interfaces.IRestaurantTableService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantTableServiceImpl implements IRestaurantTableService {

    private final RestaurantTableRepository tableRepository;

    @Override
    public List<TableResponse> getActiveTables() {
        return tableRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public TableResponse createTable(TableRequest request) {
        RestaurantTable table = RestaurantTable.builder()
                .name(request.name())
                .capacity(request.capacity())
                .active(true)
                .build();
        return toResponse(tableRepository.save(table));
    }

    @Override
    public TableResponse updateTable(Long id, TableRequest request) {
        RestaurantTable table = findById(id);
        table.setName(request.name());
        table.setCapacity(request.capacity());
        return toResponse(tableRepository.save(table));
    }

    @Override
    public void deactivateTable(Long id) {
        RestaurantTable table = findById(id);
        table.setActive(false);
        tableRepository.save(table);
    }

    private RestaurantTable findById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stolik nie został znaleziony"));
    }

    private TableResponse toResponse(RestaurantTable table) {
        return new TableResponse(table.getId(), table.getName(), table.getCapacity(), table.isActive());
    }
}
