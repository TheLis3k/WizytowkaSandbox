package pl.app.movieservice.service.interfaces;

import pl.app.movieservice.model.Movie;

import java.util.List;
import java.util.Optional;

public interface IMovieService {

    List<Movie> getAllMovies();

    Optional<Movie> getMovieById(Long id);

    Movie addMovie(Movie movie);

    Optional<Movie> updateMovie(Long id, Movie movie);

    boolean deleteMovie(Long id);
}
