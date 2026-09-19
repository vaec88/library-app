package com.library.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ICrudService<T, K> {

    Page<T> findAll(Pageable pageable);

    T findById(K id);

    T save(T entity);

    T update(K id, T entity);

    void delete(K id);
}
