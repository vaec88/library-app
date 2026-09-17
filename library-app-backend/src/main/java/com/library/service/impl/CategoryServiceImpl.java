package com.library.service.impl;

import com.library.dto.CategoryDto;
import com.library.exception.CategoryStatusException;
import com.library.exception.ModelNotFoundException;
import com.library.model.Category;
import com.library.repository.IBookRepository;
import com.library.repository.ICategoryRepository;
import com.library.repository.IGenericRepository;
import com.library.service.ICategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends CrudServiceImpl<Category, Integer> implements ICategoryService {

    private final ICategoryRepository categoryRepository;

    private final IBookRepository bookRepository;

    @Override
    protected IGenericRepository<Category, Integer> getRepository() {
        return categoryRepository;
    }

    @Override
    public Category update(Integer id, CategoryDto categoryDto) {
        Category categoryFound = categoryRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (categoryDto.getName() != null) {
            categoryFound.setName(categoryDto.getName());
        }
        if (categoryDto.getDescription() != null) {
            categoryFound.setDescription(categoryDto.getDescription());
        }
        if (categoryDto.getStatus() != null) {
            if (!categoryDto.getStatus() && bookRepository.existsByCategory(categoryFound)) {
                throw new CategoryStatusException("This category has books and cannot be disabled");
            }
            categoryFound.setStatus(categoryDto.getStatus());
        }
        return categoryRepository.save(categoryFound);
    }
}
