package com.library.service.impl;

import com.library.exception.ModelNotFoundException;
import com.library.repository.IGenericRepository;
import com.library.service.ICrudService;

import java.util.List;

public abstract class CrudServiceImpl<T, K> implements ICrudService<T, K> {

    protected abstract IGenericRepository<T, K> getRepository();

    @Override
    public List<T> findAll() {
        return getRepository().findAll();
    }

    @Override
    public T findById(K id) {
        return getRepository().findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
    }

    @Override
    public T save(T entity) {
        return getRepository().save(entity);
    }

    @Override
    public void delete(K id) {
        getRepository().findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        getRepository().deleteById(id);
    }
}
