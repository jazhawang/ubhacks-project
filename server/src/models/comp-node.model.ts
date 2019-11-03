import {Entity, model, property} from '@loopback/repository';

@model()
export class CompNode extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',    
  })
  game_id: string;

  @property({
    type: 'number',
    required: true,
    default: 0,
  })
  merge_index: number;

  @property({
    type: 'array',
    itemType: 'number',
    required: true,
  })
  subarray: (number | null)[];

  @property({
    type: 'array',
    itemType: 'string',
    required: false,
  })
  children_ids: string[];

  @property({
    type: 'string',
    default: "blocked",
  })
  status: string; // "blocked" | "available" | "done" | "waiting"

  @property({
    type: 'string',
    required: true,
  })
  team_name: string;

  constructor(data?: Partial<CompNode>) {
    super(data);
  }
}

export interface CompNodeRelations {
  // describe navigational properties here
}

export type CompNodeWithRelations = CompNode & CompNodeRelations;
