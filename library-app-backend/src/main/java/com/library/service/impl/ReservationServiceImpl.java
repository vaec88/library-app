package com.library.service.impl;

import com.library.exception.ModelNotFoundException;
import com.library.exception.ReservationException;
import com.library.model.Book;
import com.library.model.Client;
import com.library.model.Reservation;
import com.library.model.ReservationDetail;
import com.library.repository.IBookRepository;
import com.library.repository.IClientRepository;
import com.library.repository.IGenericRepository;
import com.library.repository.IReservationRepository;
import com.library.service.IReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl extends CrudServiceImpl<Reservation, Integer> implements IReservationService {

    private final IReservationRepository reservationRepository;

    private final IClientRepository clientRepository;

    private final IBookRepository bookRepository;

    @Override
    protected IGenericRepository<Reservation, Integer> getRepository() {
        return reservationRepository;
    }

    @Transactional(readOnly = true)
    @Override
    public Page<Reservation> findByClientId(Integer clientId, Pageable pageable) {
        findClient(clientId);
        return reservationRepository.findByClientId(clientId, pageable);
    }

    @Transactional
    @Override
    public Reservation save(Reservation entity) {
        Integer clientId = entity.getClient() != null ? entity.getClient().getId() : null;
        Reservation reservation = new Reservation();
        reservation.setClient(findClient(clientId));
        reservation.setReservationDate(entity.getReservationDate());
        for (Integer bookId : bookIds(entity.getDetails())) {
            reservation.addDetail(buildDetail(takeBook(bookId)));
        }
        return reservationRepository.save(reservation);
    }

    @Transactional
    @Override
    public Reservation update(Integer id, Reservation reservation) {
        Reservation reservationFound = reservationRepository
                .findById(id)
                .orElseThrow(() -> new ModelNotFoundException("Reservation id not found: " + id));
        if (reservation.getReservationDate() != null) {
            reservationFound.setReservationDate(reservation.getReservationDate());
        }
        if (reservation.getClient() != null && reservation.getClient().getId() != null) {
            reservationFound.setClient(findClient(reservation.getClient().getId()));
        }
        // An absent detail list means "leave the lines alone": the mapper never produces a null
        // collection, so an empty list is the only shape an omitted `details` can take, and R2
        // forbids a reservation without lines anyway.
        if (reservation.getDetails() != null && !reservation.getDetails().isEmpty()) {
            applyDetails(reservationFound, bookIds(reservation.getDetails()));
        }
        return reservationRepository.save(reservationFound);
    }

    @Transactional
    @Override
    public void delete(Integer id) {
        Reservation reservationFound = reservationRepository
                .findById(id)
                .orElseThrow(() -> new ModelNotFoundException("Reservation id not found: " + id));
        reservationFound.getDetails().forEach(detail -> freeBook(detail.getBook().getId()));
        reservationRepository.delete(reservationFound);
    }

    private void applyDetails(Reservation reservation, List<Integer> bookIds) {
        List<Integer> keptBookIds = new ArrayList<>();
        Iterator<ReservationDetail> iterator = reservation.getDetails().iterator();
        while (iterator.hasNext()) {
            ReservationDetail detail = iterator.next();
            Integer bookId = detail.getBook().getId();
            if (bookIds.contains(bookId)) {
                keptBookIds.add(bookId);
                continue;
            }
            freeBook(bookId);
            detail.setReservation(null);
            iterator.remove();
        }
        for (Integer bookId : bookIds) {
            if (!keptBookIds.contains(bookId)) {
                reservation.addDetail(buildDetail(takeBook(bookId)));
            }
        }
    }

    private List<Integer> bookIds(List<ReservationDetail> details) {
        List<Integer> bookIds = new ArrayList<>();
        if (details == null) {
            return bookIds;
        }
        for (ReservationDetail detail : details) {
            Integer bookId = detail.getBook() != null ? detail.getBook().getId() : null;
            if (bookId == null) {
                throw new ModelNotFoundException("Book id not found: null");
            }
            if (bookIds.contains(bookId)) {
                throw new ReservationException("Duplicated book in the reservation: " + bookId);
            }
            bookIds.add(bookId);
        }
        return bookIds;
    }

    private ReservationDetail buildDetail(Book book) {
        ReservationDetail detail = new ReservationDetail();
        detail.setBook(book);
        return detail;
    }

    private Book takeBook(Integer bookId) {
        Book book = findBookForUpdate(bookId);
        if (Boolean.FALSE.equals(book.getAvailable())) {
            throw new ReservationException("This book is not available: " + bookId);
        }
        book.setAvailable(false);
        return bookRepository.save(book);
    }

    private void freeBook(Integer bookId) {
        Book book = findBookForUpdate(bookId);
        book.setAvailable(true);
        bookRepository.save(book);
    }

    private Book findBookForUpdate(Integer bookId) {
        return bookRepository
                .findByIdForUpdate(bookId)
                .orElseThrow(() -> new ModelNotFoundException("Book id not found: " + bookId));
    }

    private Client findClient(Integer clientId) {
        if (clientId == null) {
            throw new ModelNotFoundException("Client id not found: null");
        }
        return clientRepository
                .findById(clientId)
                .orElseThrow(() -> new ModelNotFoundException("Client id not found: " + clientId));
    }
}
