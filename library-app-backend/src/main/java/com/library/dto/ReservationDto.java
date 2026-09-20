package com.library.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.library.util.OnCreate;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReservationDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer id;

    private LocalDateTime reservationDate;

    @NotNull(groups = OnCreate.class)
    private Integer clientId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String clientName;

    @Valid
    @NotEmpty(groups = OnCreate.class)
    private List<ReservationDetailDto> details;
}
