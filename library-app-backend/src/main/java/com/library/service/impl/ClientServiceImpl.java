package com.library.service.impl;

import com.library.dto.ClientDto;
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
    public Client update(Integer id, ClientDto clientDto) {
        Client clientFound = clientRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (clientDto.getFirstName() != null) {
            clientFound.setFirstName(clientDto.getFirstName());
        }
        if (clientDto.getLastName() != null) {
            clientFound.setLastName(clientDto.getLastName());
        }
        if (clientDto.getIdNumber() != null) {
            clientFound.setIdNumber(clientDto.getIdNumber());
        }
        if (clientDto.getEmail() != null) {
            clientFound.setEmail(clientDto.getEmail());
        }
        return clientRepository.save(clientFound);
    }
}
