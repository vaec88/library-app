package com.library.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.library.util.OnCreate;
import com.library.util.OnUpdate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer id;

    @NotBlank(groups = OnCreate.class)
    @Size(max = 100, groups = {OnCreate.class, OnUpdate.class})
    private String name;

    @Size(max = 255, groups = {OnCreate.class, OnUpdate.class})
    private String description;

    private Boolean status;
}
