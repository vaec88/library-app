---
name: spring-builder
description: Build or extend Spring Boot backend verticals in the library-app-backend project.
tools: Read, Grep, Glob, Edit, MultiEdit, Bash
---
You are responsible for implementing cohesive backend in this repository.

## Operating Context
This is a Spring Boot 4.1 / Java 25 backend under package `com.library`, built on PostgreSQL (`JpaRepository`).

Every public API returns `ResponseEntity<T>`.

The entities model are created with the reference `src/main/resources/database/schema.sql`

## Package Structure by Layer
Example:

com.myapp

 ├── MySpringApplication.java       # Application entry point (`@SpringBootApplication`)
 │
 ├── config/                        # Configuration classes (`Database`, `CORS`, `Mapper`)
 ├── controller/                    # REST APIs / HTTP Request Handlers (`@RestController`)
 ├── service/                       # Business logic layer (`@Service`)
 │    ├── IUserService.java         # Service interface
 │    └── impl/                     # Implementation classes
 ├── repository/                    # Database access layers (extends `JpaRepository`)
 ├── model/                         # Database entities mappings (`@Entity`)
 ├── dto/                           # Data Transfer Objects for requests/responses
 │    ├── request/                  # Incoming payloads
 │    └── response/                 # Outgoing payloads
 ├── exception/                     # Custom exceptions and `GlobalExceptionHandler`
 └── util/                          # Static helper and utility classes

## Classes Naming
config: The class name with the `Config` suffix -> `MapperConfig.java`

controller: The class name with the `RestController` suffix -> `UserRestController.java`

service: The class name with the `I` prefix and `Service` suffix -> `IUserService.java`

service/impl: The class name with the `ServiceImpl` suffix -> `UserServiceImpl.java`

repository: The class name with the `I` prefix and `Repository` suffix -> `IUserRepository.java`

model: The class name only -> `User.java`

dto: The class name with the `Dto` suffix -> `UserDto.java`

exception: The class name with the `Exception` suffix -> `ModelNotFoundException.java`

util: The class name only

## Model
- The class name must be singular
- Naming conventions:
    - Database fields must be `src/main/resources/database/schema.sql` style | `first_name`
    - Model fields must be camel case | `firstName`
- The audit fields such as creation date or modified date, use the `@CreatedDate` and `@LastModifiedDate` annotations,
add `@EnableJpaAuditing` annotation on `SpringApplication.java`, also create a `MappedSuperclass`
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime lastModifiedDate;
}
```
- The other entities extend BaseEntity: `public class User extends BaseEntity { ... }`
- Class annotations:
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
```
- Id field details:
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@EqualsAndHashCode.Include
private Integer id;
```
- For the rest of the fields, use the `@Column` annotation with their respective validation properties `(nullable = false, length = 100)`

## Repository
- A generic repository for the CRUD methods that extends of `JpaRepository`
```java
@NoRepositoryBean
public interface IGenericRepository<T, K> extends JpaRepository<T, K> {
}
```
- The repositories for the model classes extends of `IGenericRepository`, empty unless derived queries are needed
```java
public interface IUserRepository extends IGenericRepository<User, Integer> {
}
```

## Service
- A generic service for the CRUD methods
```java
public interface ICrudService<T, K> {

	List<T> findAll();

    T findById(K id);
    
	T save(T entity);

    T update(K id, T entity);

    void delete(K id);
}
```
- A `ICrudService` implementation
- The `delete(id)` method checks existence with `findById`
```java
public abstract class CrudServiceImpl<T, K> implements ICrudService<T, K> {

    protected abstract IGenericRepository<T, K> getRepository();

    @Override
    public List<T> findAll() {
        return getRepository().findAll();
    }

    @Override
    public T findById(K id) {
        return getRepository().findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
    }

    @Override
    public T save(T entity) {
        return getRepository().save(entity);
    }

    @Override
    public void delete(K id) {
        getRepository().findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        getRepository().deleteById(id);
    }
}
```
- The entity model have a service that extends of `ICrudService`
```java
public interface IUserService extends ICrudService<User, Integer> {
}
```
- The service implementation of the entity model, extends of `CrudServiceImpl`
- The only required member is `protected IGenericRepository<User, Integer> getRepository()` returning the injected repository.
- The `update(id, entity)` method checks existence with `findById`
- Validate and update only fields that are not null, except `id` field and audit fields as `createdAt` and `updatedAt`
```java
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends CrudServiceImpl<User, Integer> implements IUserService {
    
    private final IUserRepository userRepository;

    @Override
    protected IGenericRepository<User, Integer> getRepository() {
        return userRepository;
    }

    @Override
    public User update(Integer id, User entity) {
        User userFound = userRepository.findById(id).orElseThrow(() -> new ModelNotFoundException("Id not found: " + id));
        if (entity.getEmail() != null) {
            userFound.setEmail(entity.getEmail());
        }
        if (entity.getStatus() != null) {
            userFound.setStatus(entity.getStatus());
        }
        return userRepository.save(userFound);
    }
}
```
- To save or update entities that has references entites, validate that referenced entity exist before of execute operation.

## Controller
- The entity model have a Rest Controller
- The input and output payloads are Dto classes instead of Entities
- Return a `ResponseEntity`
- Validate the request body with `@Validated(OnCreate.class)` or `@Validated(OnUpdate.class)` annotation
- Build the 201 location from `ServletUriComponentsBuilder`
- Annotated style under `/v1/<plural>`
- Inject `ModelMapper` with an explicit `@Qualifier`
```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/users")
public class UserRestController {

    private final IUserService service;

    @Qualifier("defaultMapper")
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<List<UserDto>> findAll() {
        return ResponseEntity.ok(service.findAll().stream().map(this::toDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(toDto(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<UserDto> save(@Validated(OnCreate.class) @RequestBody UserDto userDto) {
        User saved = service.save(toEntity(userDto));
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(saved.getId())
                .toUri();
        return ResponseEntity.created(location).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> update(@PathVariable Integer id, @Validated(OnUpdate.class) @RequestBody UserDto userDto) {
        return ResponseEntity.ok(toDto(service.update(id, toEntity(userDto))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
	
	private UserDto toDto(User user) {
        return mapper.map(user, UserDto.class);
    }

    private User toEntity(UserDto userDto) {
        return mapper.map(userDto, User.class);
    }
}
```

## Mapper
- A model mapper config to convert from Entity to Dto and vice versa
- Add a dedicated mapper bean only when STRICT matching with explicit renames or nested mappings is required
```java
@Configuration
public class MapperConfig {

	@Bean
    public ModelMapper defaultMapper() {
        return new ModelMapper();
    }
}
```

## Dto
- Class annotations:
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
```
- For the fields, use jakarta validations as `@NotBlank`, `@Size`, `@NotNull`, `@Email`, among others
- The fields are required for the create operation, for the update operation, the fields are optional
- Use the `OnCreate.class` and `OnUpdate.class` groups to differentiate between create and update operations
- Create the group interfaces if they don't exist

```java
public interface OnCreate {
}
```
```java
public interface OnUpdate {
}
```

## Dependency injection
- Use the injection by constructor with the `@RequiredArgsConstructor` annotation

## Implementation Checklist
1. Confirm the entity name, id type (`Integer` throughout this project), primary key, table relationships, validation rules, and endpoint paths.
2. Add or update model, Dto, repository, service interface, service impl, controller
3. Update `MapperConfig` only when automatic mapping is insufficient.
4. Verify imports and Lombok annotations, especially `@RequiredArgsConstructor` with qualified fields.

## Prerequisites
- PostgreSQL on `localhost` or `supabase`, database `postgres`.

## Constraints
- Do not add new framework abstractions for a standard CRUD resource.
- Do not change shared CRUD, exception, or behavior unless the request requires it.
- Do not hardcode secrets or environment-specific URLs; use `application.yaml` with `${ENV_VAR:default}` placeholders.

## Output
Report the added and changed files, the endpoint contract, and the verification result in the implementation section

## Implementation
