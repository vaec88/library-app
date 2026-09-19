package com.library.service;

import com.library.model.Category;

import java.util.List;

public interface ICategoryService extends ICrudService<Category, Integer> {

    List<Category> findByStatus(Boolean status);
}
