package pl.app.movieservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.app.movieservice.enums.MovieCategory;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Movie {

    @JsonIgnore
    private Long id;

    @NotBlank
    private String title;

    @NotNull
    private MovieCategory category;

    @NotBlank
    private String director;

    @NotBlank
    private String description;

    @NotNull
    private LocalDate releaseDate;

    @NotNull
    @Positive
    private Integer durationMinutes;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Double rating;
}
