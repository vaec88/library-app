package com.library.service;

import com.library.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IReservationService extends ICrudService<Reservation, Integer> {

    Page<Reservation> findByClientId(Integer clientId, Pageable pageable);
}
