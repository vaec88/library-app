package com.library.service;

import com.library.dto.CategoryDto;
import com.library.model.Category;

public interface ICategoryService extends ICrudService<Category, Integer> {

    Category update(Integer id, CategoryDto categoryDto);
}
