package pl.app.movieservice.repository;

import org.springframework.stereotype.Repository;
import pl.app.movieservice.model.Movie;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class MovieRepository {

    private final List<Movie> store = new ArrayList<>();

    public List<Movie> findAll() {
        return store;
    }

    public Movie save(Movie movie) {
        if (movie.getId() == null) {
            long nextId = store.stream().mapToLong(Movie::getId).max().orElse(0) + 1;
            movie.setId(nextId);
        }
        store.add(movie);
        return movie;
    }

    public Optional<Movie> findById(Long id) {
        return store.stream().filter(m -> m.getId().equals(id)).findFirst();
    }

    public Optional<Movie> update(Long id, Movie updated) {
        for (int i = 0; i < store.size(); i++) {
            if (store.get(i).getId().equals(id)) {
                updated.setId(id);
                store.set(i, updated);
                return Optional.of(updated);
            }
        }
        return Optional.empty();
    }

    public boolean deleteById(Long id) {
        return store.removeIf(m -> m.getId().equals(id));
    }

    public boolean isEmpty() {
        return store.isEmpty();
    }
}
