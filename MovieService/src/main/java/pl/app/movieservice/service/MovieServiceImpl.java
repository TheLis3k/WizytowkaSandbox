package pl.app.movieservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.app.movieservice.model.Movie;
import pl.app.movieservice.repository.MovieRepository;
import pl.app.movieservice.service.interfaces.IMovieService;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements IMovieService {

    private final MovieRepository movieRepository;

    @Override
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Override
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }

    @Override
    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    @Override
    public Optional<Movie> updateMovie(Long id, Movie movie) {
        return movieRepository.update(id, movie);
    }

    @Override
    public boolean deleteMovie(Long id) {
        return movieRepository.deleteById(id);
    }
}
