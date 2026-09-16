package com.library.service.impl;

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
    public Category update(Integer id, Category entity) {
        Category categoryFound = categoryRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (entity.getName() != null) {
            categoryFound.setName(entity.getName());
        }
        if (entity.getDescription() != null) {
            categoryFound.setDescription(entity.getDescription());
        }
        if (entity.getStatus() != null) {
            categoryFound.setStatus(entity.getStatus());
        }
        return categoryRepository.save(categoryFound);
    }
}
