package com.library.controller;

import com.library.dto.ReservationDto;
import com.library.model.Reservation;
import com.library.service.IReservationService;
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
@RequestMapping("/v1/reservations")
public class ReservationRestController {

    private final IReservationService service;

    @Qualifier("defaultMapper")
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<Page<ReservationDto>> findAll(Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable).map(this::toDto));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<Page<ReservationDto>> findByClientId(@PathVariable Integer clientId, Pageable pageable) {
        return ResponseEntity.ok(service.findByClientId(clientId, pageable).map(this::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ReservationDto> save(@Validated({Default.class, OnCreate.class}) @RequestBody ReservationDto reservationDto) {
        Reservation saved = service.save(toEntity(reservationDto));
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationDto> update(@PathVariable Integer id, @Validated({Default.class, OnUpdate.class}) @RequestBody ReservationDto reservationDto) {
        return ResponseEntity.ok(toDto(service.update(id, toEntity(reservationDto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    private ReservationDto toDto(Reservation reservation) {
        return mapper.map(reservation, ReservationDto.class);
    }

    private Reservation toEntity(ReservationDto reservationDto) {
        return mapper.map(reservationDto, Reservation.class);
    }
}
