package com.library.service.impl;

import com.library.dto.BookDto;
import com.library.exception.CategoryStatusException;
import com.library.exception.ModelNotFoundException;
import com.library.model.Book;
import com.library.model.Category;
import com.library.repository.IBookRepository;
import com.library.repository.IGenericRepository;
import com.library.service.IBookService;
import com.library.service.ICategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookServiceImpl extends CrudServiceImpl<Book, Integer> implements IBookService {

    private final IBookRepository bookRepository;

    private final ICategoryService categoryService;

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
    public Book update(Integer id, BookDto bookDto) {
        Book bookFound = bookRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (bookDto.getTitle() != null) {
            bookFound.setTitle(bookDto.getTitle());
        }
        if (bookDto.getAuthor() != null) {
            bookFound.setAuthor(bookDto.getAuthor());
        }
        if (bookDto.getIsbn() != null) {
            bookFound.setIsbn(bookDto.getIsbn());
        }
        if (bookDto.getAvailable() != null) {
            bookFound.setAvailable(bookDto.getAvailable());
        }
        if (bookDto.getCategoryId() != null) {
            bookFound.setCategory(findCategory(bookDto.getCategoryId()));
        }
        return bookRepository.save(bookFound);
    }

    private Category findCategory(Integer categoryId) {
        if (categoryId == null) {
            throw new ModelNotFoundException("Category id not found: null");
        }
        Category category = categoryService.findById(categoryId);
        if (Boolean.FALSE.equals(category.getStatus())) {
            throw new CategoryStatusException("This category is disabled and cannot be assigned to a book");
        }
        return category;
    }
}
