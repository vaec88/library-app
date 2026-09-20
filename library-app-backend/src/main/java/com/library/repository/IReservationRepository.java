package com.library.repository;

import com.library.model.Reservation;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

public interface IReservationRepository extends IGenericRepository<Reservation, Integer> {

    @EntityGraph(attributePaths = {"client", "details", "details.book"})
    Page<Reservation> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = {"client", "details", "details.book"})
    Page<Reservation> findByClientId(Integer clientId, Pageable pageable);

    boolean existsByDetailsBookId(Integer bookId);
}
