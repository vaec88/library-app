package com.library.repository;

import com.library.model.Book;
import jakarta.persistence.LockModeType;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface IBookRepository extends IGenericRepository<Book, Integer> {

    @EntityGraph(attributePaths = "category")
    Page<Book> findAll(@NonNull Pageable pageable);

    @EntityGraph(attributePaths = "category")
    List<Book> findByAvailable(Boolean available);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Book b where b.id = :id")
    Optional<Book> findByIdForUpdate(@Param("id") Integer id);

    boolean existsByCategoryId(Integer id);
}
