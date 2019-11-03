import {Entity, model, property} from '@loopback/repository';

@model()
export class Team extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    defaultFn: 'uuid',
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  team_name: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  usernames?: string[];

  @property({
    type: 'string',
    required: true,
  })
  root: string;

  @property({
    type: 'string',
    required: true,
  })
  game_id: string;

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
