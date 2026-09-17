package com.library.service;

import com.library.dto.BookDto;
import com.library.model.Book;

public interface IBookService extends ICrudService<Book, Integer> {

    Book update(Integer id, BookDto bookDto);
}
