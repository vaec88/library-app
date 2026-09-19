package com.library.controller;

import com.library.dto.CategoryDto;
import com.library.model.Category;
import com.library.service.ICategoryService;
import com.library.util.OnCreate;
import com.library.util.OnUpdate;
import jakarta.validation.groups.Default;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/categories")
public class CategoryRestController {

    private final ICategoryService service;

    @Qualifier("defaultMapper")
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<Page<CategoryDto>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable).map(this::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<CategoryDto> save(@Validated({Default.class, OnCreate.class}) @RequestBody CategoryDto categoryDto) {
        Category saved = service.save(toEntity(categoryDto));
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> update(@PathVariable Integer id, @Validated(OnUpdate.class) @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(toDto(service.update(id, toEntity(categoryDto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private CategoryDto toDto(Category category) {
        return mapper.map(category, CategoryDto.class);
    }

    private Category toEntity(CategoryDto categoryDto) {
        return mapper.map(categoryDto, Category.class);
    }
}
