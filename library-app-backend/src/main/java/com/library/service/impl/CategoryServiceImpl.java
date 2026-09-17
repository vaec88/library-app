package com.library.service.impl;

import com.library.dto.CategoryDto;
import com.library.exception.ModelNotFoundException;
import com.library.model.Category;
import com.library.repository.ICategoryRepository;
import com.library.repository.IGenericRepository;
import com.library.service.ICategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl extends CrudServiceImpl<Category, Integer> implements ICategoryService {

    private final ICategoryRepository categoryRepository;

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
            categoryFound.setStatus(categoryDto.getStatus());
        }
        return categoryRepository.save(categoryFound);
    }
}
