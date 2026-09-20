package com.library.service.impl;

import com.library.exception.CategoryStatusException;
import com.library.exception.ModelNotFoundException;
import com.library.exception.ReservationException;
import com.library.model.Book;
import com.library.model.Category;
import com.library.repository.IBookRepository;
import com.library.repository.ICategoryRepository;
import com.library.repository.IGenericRepository;
import com.library.repository.IReservationRepository;
import com.library.service.IBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookServiceImpl extends CrudServiceImpl<Book, Integer> implements IBookService {

    private final IBookRepository bookRepository;

    private final ICategoryRepository categoryRepository;

    private final IReservationRepository reservationRepository;

    @Override
    protected IGenericRepository<Book, Integer> getRepository() {
        return bookRepository;
    }

    @Transactional(readOnly = true)
    @Override
    public List<Book> findByAvailable(Boolean available) {
        return bookRepository.findByAvailable(available);
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

    @Transactional
    @Override
    public void delete(Integer id) {
        Book bookFound = bookRepository
                .findById(id)
                .orElseThrow(() -> new ModelNotFoundException("Book id not found: " + id));
        if (reservationRepository.existsByDetailsBookId(bookFound.getId())) {
            throw new ReservationException("This book has reservations and cannot be deleted");
        }
        bookRepository.delete(bookFound);
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
