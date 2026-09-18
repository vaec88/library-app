package com.library.service.impl;

import com.library.exception.ModelNotFoundException;
import com.library.model.Client;
import com.library.repository.IClientRepository;
import com.library.repository.IGenericRepository;
import com.library.service.IClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl extends CrudServiceImpl<Client, Integer> implements IClientService {

    private final IClientRepository clientRepository;

    @Override
    protected IGenericRepository<Client, Integer> getRepository() {
        return clientRepository;
    }

    @Transactional
    @Override
    public Client update(Integer id, Client client) {
        Client clientFound = clientRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (client.getFirstName() != null) {
            clientFound.setFirstName(client.getFirstName());
        }
        if (client.getLastName() != null) {
            clientFound.setLastName(client.getLastName());
        }
        if (client.getIdNumber() != null) {
            clientFound.setIdNumber(client.getIdNumber());
        }
        if (client.getEmail() != null) {
            clientFound.setEmail(client.getEmail());
        }
        return clientRepository.save(clientFound);
    }
}
