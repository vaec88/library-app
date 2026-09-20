package com.library.config;

import com.library.dto.ReservationDto;
import com.library.model.Client;
import com.library.model.Reservation;
import org.modelmapper.Conditions;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    /** `clientName` has no single source property, so it is built from the client full name. */
    private static final Converter<Client, String> CLIENT_NAME_CONVERTER = context -> {
        Client client = context.getSource();
        return client == null ? null : client.getFirstName() + " " + client.getLastName();
    };

    @Bean
    public ModelMapper defaultMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setPropertyCondition(Conditions.isNotNull());
        modelMapper.addMappings(new PropertyMap<Reservation, ReservationDto>() {
            @Override
            protected void configure() {
                using(CLIENT_NAME_CONVERTER).map(source.getClient(), destination.getClientName());
            }
        });
        return modelMapper;
    }
}
