package com.library.service.impl;

import com.library.exception.CategoryStatusException;
import com.library.exception.ModelNotFoundException;
import com.library.model.Category;
import com.library.repository.IBookRepository;
import com.library.repository.ICategoryRepository;
import com.library.repository.IGenericRepository;
import com.library.service.ICategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends CrudServiceImpl<Category, Integer> implements ICategoryService {

    private final ICategoryRepository categoryRepository;

    private final IBookRepository bookRepository;

    @Override
    protected IGenericRepository<Category, Integer> getRepository() {
        return categoryRepository;
    }

    @Transactional
    @Override
    public Category update(Integer id, Category category) {
        Category categoryFound = categoryRepository
                .findById(id)
                .orElseThrow(() -> new ModelNotFoundException("Category id not found: " + id));
        if (category.getName() != null) {
            categoryFound.setName(category.getName());
        }
        if (category.getDescription() != null) {
            categoryFound.setDescription(category.getDescription());
        }
        if (category.getStatus() != null) {
            if (!category.getStatus() && bookRepository.existsByCategoryId(categoryFound.getId())) {
                throw new CategoryStatusException("This category has books and cannot be disabled");
            }
            categoryFound.setStatus(category.getStatus());
        }
        return categoryRepository.save(categoryFound);
    }

    @Transactional
    @Override
    public void delete(Integer id) {
        Category categoryFound = categoryRepository
                .findById(id)
                .orElseThrow(() -> new ModelNotFoundException("Category id not found: " + id));
        if (bookRepository.existsByCategoryId(categoryFound.getId())) {
            throw new CategoryStatusException("This category has books and cannot be deleted");
        }
        categoryRepository.delete(categoryFound);
    }
}
