package pl.app.movieservice.bootstrap;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import pl.app.movieservice.enums.MovieCategory;
import pl.app.movieservice.model.Movie;
import pl.app.movieservice.repository.MovieRepository;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;

    @Override
    public void run(String... args) {
        if (!movieRepository.isEmpty()) {
            return;
        }

        List<Movie> seed = List.of(
                Movie.builder().id(1L).title("Inception").category(MovieCategory.SCIENCE_FICTION)
                        .director("Christopher Nolan").description("A thief who steals secrets through dream-sharing technology.")
                        .releaseDate(LocalDate.of(2010, 7, 16)).durationMinutes(148).rating(8.8).build(),
                Movie.builder().id(2L).title("The Dark Knight").category(MovieCategory.ACTION)
                        .director("Christopher Nolan").description("Batman faces the Joker, who wants to plunge Gotham into anarchy.")
                        .releaseDate(LocalDate.of(2008, 7, 18)).durationMinutes(152).rating(9.0).build(),
                Movie.builder().id(3L).title("The Shawshank Redemption").category(MovieCategory.DRAMA)
                        .director("Frank Darabont").description("Two imprisoned men bond over years, finding solace and redemption.")
                        .releaseDate(LocalDate.of(1994, 9, 23)).durationMinutes(142).rating(9.3).build(),
                Movie.builder().id(4L).title("The Godfather").category(MovieCategory.DRAMA)
                        .director("Francis Ford Coppola").description("The aging patriarch of a crime dynasty transfers control to his son.")
                        .releaseDate(LocalDate.of(1972, 3, 24)).durationMinutes(175).rating(9.2).build(),
                Movie.builder().id(5L).title("Pulp Fiction").category(MovieCategory.THRILLER)
                        .director("Quentin Tarantino").description("The lives of two mob hitmen, a boxer, and a gangster intertwine.")
                        .releaseDate(LocalDate.of(1994, 10, 14)).durationMinutes(154).rating(8.9).build(),
                Movie.builder().id(6L).title("The Silence of the Lambs").category(MovieCategory.HORROR)
                        .director("Jonathan Demme").description("A young FBI cadet seeks help from imprisoned cannibal Hannibal Lecter.")
                        .releaseDate(LocalDate.of(1991, 2, 14)).durationMinutes(118).rating(8.6).build(),
                Movie.builder().id(7L).title("Forrest Gump").category(MovieCategory.DRAMA)
                        .director("Robert Zemeckis").description("A man with low IQ witnesses and participates in key historical events.")
                        .releaseDate(LocalDate.of(1994, 7, 6)).durationMinutes(142).rating(8.8).build(),
                Movie.builder().id(8L).title("Spirited Away").category(MovieCategory.ANIMATION)
                        .director("Hayao Miyazaki").description("A girl enters a magical world and must work to free her transformed parents.")
                        .releaseDate(LocalDate.of(2001, 7, 20)).durationMinutes(125).rating(8.6).build(),
                Movie.builder().id(9L).title("Interstellar").category(MovieCategory.SCIENCE_FICTION)
                        .director("Christopher Nolan").description("Astronauts travel through a wormhole in search of a new home for humanity.")
                        .releaseDate(LocalDate.of(2014, 11, 7)).durationMinutes(169).rating(8.7).build(),
                Movie.builder().id(10L).title("The Grand Budapest Hotel").category(MovieCategory.COMEDY)
                        .director("Wes Anderson").description("A concierge and his protégé become embroiled in a murder mystery.")
                        .releaseDate(LocalDate.of(2014, 3, 28)).durationMinutes(99).rating(8.1).build()
        );

        seed.forEach(movieRepository::save);
    }
}
