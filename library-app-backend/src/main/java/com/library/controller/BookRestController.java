package com.library.controller;

import com.library.dto.BookDto;
import com.library.model.Book;
import com.library.service.IBookService;
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
@RequestMapping("/v1/books")
public class BookRestController {

    private final IBookService service;

    @Qualifier("defaultMapper")
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<Page<BookDto>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable).map(this::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<BookDto> save(@Validated({Default.class, OnCreate.class}) @RequestBody BookDto bookDto) {
        Book saved = service.save(toEntity(bookDto));
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookDto> update(@PathVariable Integer id, @Validated(OnUpdate.class) @RequestBody BookDto bookDto) {
        return ResponseEntity.ok(toDto(service.update(id, toEntity(bookDto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private BookDto toDto(Book book) {
        return mapper.map(book, BookDto.class);
    }

    private Book toEntity(BookDto bookDto) {
        return mapper.map(bookDto, Book.class);
    }
}
