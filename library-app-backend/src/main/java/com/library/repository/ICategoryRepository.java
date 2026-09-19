package com.library.repository;

import com.library.model.Category;

import java.util.List;

public interface ICategoryRepository extends IGenericRepository<Category, Integer> {

    List<Category> findByStatus(Boolean status);
}
