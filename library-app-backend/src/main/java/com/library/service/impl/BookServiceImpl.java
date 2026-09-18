package com.library.service.impl;

import com.library.exception.CategoryStatusException;
import com.library.exception.ModelNotFoundException;
import com.library.model.Book;
import com.library.model.Category;
import com.library.repository.IBookRepository;
import com.library.repository.ICategoryRepository;
import com.library.repository.IGenericRepository;
import com.library.service.IBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookServiceImpl extends CrudServiceImpl<Book, Integer> implements IBookService {

    private final IBookRepository bookRepository;

    private final ICategoryRepository categoryRepository;

    @Override
    protected IGenericRepository<Book, Integer> getRepository() {
        return bookRepository;
    }

    @Transactional
    @Override
    public Book save(Book entity) {
        Integer categoryId = entity.getCategory() != null ? entity.getCategory().getId() : null;
        entity.setCategory(findCategory(categoryId));
        return bookRepository.save(entity);
    }

    @Transactional
    @Override
    public Book update(Integer id, Book book) {
        Book bookFound = bookRepository
                .findById(id)
                .orElseThrow(() -> new ModelNotFoundException("Book id not found: " + id));
        if (book.getTitle() != null) {
            bookFound.setTitle(book.getTitle());
        }
        if (book.getAuthor() != null) {
            bookFound.setAuthor(book.getAuthor());
        }
        if (book.getIsbn() != null) {
            bookFound.setIsbn(book.getIsbn());
        }
        if (book.getAvailable() != null) {
            bookFound.setAvailable(book.getAvailable());
        }
        if (book.getCategory() != null && book.getCategory().getId() != null) {
            bookFound.setCategory(findCategory(book.getCategory().getId()));
        }
        return bookRepository.save(bookFound);
    }

    private Category findCategory(Integer categoryId) {
        if (categoryId == null) {
            throw new ModelNotFoundException("Category id not found: null");
        }
        Category category = categoryRepository
                .findById(categoryId)
                .orElseThrow(() -> new ModelNotFoundException("Category id not found: " + categoryId));
        if (Boolean.FALSE.equals(category.getStatus())) {
            throw new CategoryStatusException("This category is disabled and cannot be assigned to a book");
        }
        return category;
    }
}
