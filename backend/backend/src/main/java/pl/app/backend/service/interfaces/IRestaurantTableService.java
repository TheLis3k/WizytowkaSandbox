package pl.app.backend.service.interfaces;

import pl.app.backend.dto.table.TableRequest;
import pl.app.backend.dto.table.TableResponse;

import java.util.List;

public interface IRestaurantTableService {
    List<TableResponse> getActiveTables();
    List<TableResponse> getAllTables();
    TableResponse createTable(TableRequest request);
    TableResponse updateTable(Long id, TableRequest request);
    void deactivateTable(Long id);
}
