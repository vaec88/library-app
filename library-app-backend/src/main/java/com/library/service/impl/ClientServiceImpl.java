package com.library.service.impl;

import com.library.exception.ModelNotFoundException;
import com.library.model.Client;
import com.library.repository.IClientRepository;
import com.library.repository.IGenericRepository;
import com.library.service.IClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl extends CrudServiceImpl<Client, Integer> implements IClientService {

    private final IClientRepository clientRepository;

    @Override
    protected IGenericRepository<Client, Integer> getRepository() {
        return clientRepository;
    }

    @Override
    public Client update(Integer id, Client entity) {
        Client clientFound = clientRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (entity.getFirstName() != null) {
            clientFound.setFirstName(entity.getFirstName());
        }
        if (entity.getLastName() != null) {
            clientFound.setLastName(entity.getLastName());
        }
        if (entity.getIdNumber() != null) {
            clientFound.setIdNumber(entity.getIdNumber());
        }
        if (entity.getEmail() != null) {
            clientFound.setEmail(entity.getEmail());
        }
        return clientRepository.save(clientFound);
    }
}
