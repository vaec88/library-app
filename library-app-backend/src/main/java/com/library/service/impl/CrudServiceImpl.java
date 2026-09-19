package com.library.service.impl;

import com.library.exception.ModelNotFoundException;
import com.library.repository.IGenericRepository;
import com.library.service.ICrudService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public abstract class CrudServiceImpl<T, K> implements ICrudService<T, K> {

    protected abstract IGenericRepository<T, K> getRepository();

    @Override
    public Page<T> findAll(Pageable pageable) {
        return getRepository().findAll(pageable);
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
