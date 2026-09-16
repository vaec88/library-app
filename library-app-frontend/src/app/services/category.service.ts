import { Service } from '@angular/core';

import { environment } from '../../environments/environment';
import { Category } from '../models/category';
import { GenericService } from './generic.service';

@Service()
export class CategoryService extends GenericService<Category> {

    protected override url = `${environment.HOST}/v1/categories`;
}
