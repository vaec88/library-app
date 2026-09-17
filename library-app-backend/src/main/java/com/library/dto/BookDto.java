package com.library.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.library.util.NullOrNotBlank;
import com.library.util.OnCreate;
import com.library.util.OnUpdate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer id;

    @NotBlank(groups = OnCreate.class)
    @NullOrNotBlank(groups = OnUpdate.class)
    @Size(max = 200, groups = {OnCreate.class, OnUpdate.class})
    private String title;

    @NotBlank(groups = OnCreate.class)
    @NullOrNotBlank(groups = OnUpdate.class)
    @Size(max = 150, groups = {OnCreate.class, OnUpdate.class})
    private String author;

    @NullOrNotBlank(groups = OnUpdate.class)
    @Size(max = 13, groups = {OnCreate.class, OnUpdate.class})
    private String isbn;

    private Boolean available;

    @NotNull(groups = OnCreate.class)
    private Integer categoryId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String categoryName;
}
