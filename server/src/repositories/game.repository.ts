import {DefaultCrudRepository} from '@loopback/repository';
import {Game, GameRelations} from '../models';
import {ServerDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class GameRepository extends DefaultCrudRepository<
  Game,
  typeof Game.prototype.id,
  GameRelations
> {
  constructor(
    @inject('datasources.server') dataSource: ServerDataSource,
  ) {
    super(Game, dataSource);
  }
}
