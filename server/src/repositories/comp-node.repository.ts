import {DefaultCrudRepository} from '@loopback/repository';
import {CompNode, CompNodeRelations} from '../models';
import {ServerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class CompNodeRepository extends DefaultCrudRepository<
  CompNode,
  typeof CompNode.prototype.id,
  CompNodeRelations
> {
  constructor(
    @inject('datasources.server') dataSource: ServerDataSource,
  ) {
    super(CompNode, dataSource);
  }
}
