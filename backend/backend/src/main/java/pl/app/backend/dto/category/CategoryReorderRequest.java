package pl.app.backend.dto.category;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CategoryReorderRequest {

    @NotNull
    private List<Long> ids;
}
