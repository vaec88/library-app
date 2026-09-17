package com.library.service;

import com.library.dto.ClientDto;
import com.library.model.Client;

public interface IClientService extends ICrudService<Client, Integer> {

    Client update(Integer id, ClientDto clientDto);
}
