package com.library.repository;

import com.library.model.Book;
import com.library.model.Category;

public interface IBookRepository extends IGenericRepository<Book, Integer> {

    boolean existsByCategory(Category category);
}
