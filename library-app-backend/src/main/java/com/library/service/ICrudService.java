package com.library.service;

import java.util.List;

public interface ICrudService<T, K> {

    List<T> findAll();

    T findById(K id);

    T save(T entity);

    void delete(K id);
}
