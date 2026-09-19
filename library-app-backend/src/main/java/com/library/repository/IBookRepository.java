package com.library.repository;

import com.library.model.Book;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;

public interface IBookRepository extends IGenericRepository<Book, Integer> {

    @EntityGraph(attributePaths = "category")
    Page<Book> findAll(@NonNull Pageable pageable);

    boolean existsByCategoryId(Integer id);
}
