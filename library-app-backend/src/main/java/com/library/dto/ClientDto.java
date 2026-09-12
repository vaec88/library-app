package com.library.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.library.util.OnCreate;
import com.library.util.OnUpdate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClientDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer id;

    @NotBlank(groups = OnCreate.class)
    @Size(max = 100, groups = {OnCreate.class, OnUpdate.class})
    private String firstName;

    @NotBlank(groups = OnCreate.class)
    @Size(max = 100, groups = {OnCreate.class, OnUpdate.class})
    private String lastName;

    @NotBlank(groups = OnCreate.class)
    @Size(max = 10, groups = {OnCreate.class, OnUpdate.class})
    private String idNumber;

    @NotBlank(groups = OnCreate.class)
    @Email(groups = {OnCreate.class, OnUpdate.class})
    @Size(max = 150, groups = {OnCreate.class, OnUpdate.class})
    private String email;
}
