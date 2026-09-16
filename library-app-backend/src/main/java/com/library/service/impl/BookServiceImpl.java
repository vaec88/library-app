package com.library.service.impl;

import com.library.exception.ModelNotFoundException;
import com.library.model.Book;
import com.library.model.Category;
import com.library.repository.IBookRepository;
import com.library.repository.ICategoryRepository;
import com.library.repository.IGenericRepository;
import com.library.service.IBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookServiceImpl extends CrudServiceImpl<Book, Integer> implements IBookService {

    private final IBookRepository bookRepository;
    private final ICategoryRepository categoryRepository;

    @Override
    protected IGenericRepository<Book, Integer> getRepository() {
        return bookRepository;
    }

    @Override
    public Book save(Book entity) {
        Integer categoryId = entity.getCategory() != null ? entity.getCategory().getId() : null;
        entity.setCategory(findCategory(categoryId));
        return bookRepository.save(entity);
    }

    @Override
    public Book update(Integer id, Book entity) {
        Book bookFound = bookRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (entity.getTitle() != null) {
            bookFound.setTitle(entity.getTitle());
        }
        if (entity.getAuthor() != null) {
            bookFound.setAuthor(entity.getAuthor());
        }
        if (entity.getIsbn() != null) {
            bookFound.setIsbn(entity.getIsbn());
        }
        if (entity.getAvailable() != null) {
            bookFound.setAvailable(entity.getAvailable());
        }
        if (entity.getCategory() != null && entity.getCategory().getId() != null) {
            bookFound.setCategory(findCategory(entity.getCategory().getId()));
        }
        return bookRepository.save(bookFound);
    }

    private Category findCategory(Integer categoryId) {
        if (categoryId == null) {
            throw new ModelNotFoundException("Category id not found: null");
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ModelNotFoundException("Category id not found: " + categoryId));
    }
}
