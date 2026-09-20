package com.library.service;

import com.library.model.Book;

import java.util.List;

public interface IBookService extends ICrudService<Book, Integer> {

    List<Book> findByAvailable(Boolean available);
}
