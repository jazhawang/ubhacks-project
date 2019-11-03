import {Entity, model, property} from '@loopback/repository';

@model()
export class Game extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  game_hash: string;

  @property({
    type: 'array',    
    itemType: 'string',
  })
  team_ids?: string[];

  constructor(data?: Partial<Game>) {
    super(data);
  }
}

export interface GameRelations {
  // describe navigational properties here
}

export type GameWithRelations = Game & GameRelations;
