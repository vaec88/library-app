package com.library.repository;

import com.library.model.Book;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface IBookRepository extends IGenericRepository<Book, Integer> {

    @EntityGraph(attributePaths = "category")
    List<Book> findAll();

    boolean existsByCategoryId(Integer id);
}
