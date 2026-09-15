import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export abstract class GenericService<T> {

    protected http = inject(HttpClient);
    protected abstract url: string;

    get resourceUrl() {
        return this.url;
    }

    findAll() {
        return this.http.get<T[]>(this.url);
    }

    findById(id: number) {
        return this.http.get<T>(`${this.url}/${id}`);
    }

    save(type: T) {
        return this.http.post(this.url, type);
    }

    update(id: number, type: T) {
        return this.http.put(`${this.url}/${id}`, type);
    }

    delete(id: number) {
        return this.http.delete(`${this.url}/${id}`);
    }
}
