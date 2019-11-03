
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';

import {CompNode} from '../models';
import {CompNodeRepository} from '../repositories';
import {NodeOutputType, CompType} from './types';

export class GameControllerController {
  constructor(
    @repository(CompNodeRepository)
    public compNodeRepository : CompNodeRepository,
  ) {}

  @get('/{game_hash}/', {
    responses: {
      '200': {
        description: 'Get the current game determined by game_hash',
        //content: {'application/json': },
      },
    },
  })
  async getInfo(    
    @param.path.string('game_hash') game_hash: string,
  ): Promise<NodeOutputType> {
    return {
      id: "someID",
      subarray: [] as unknown as [number],
      merge_index: 0,
      children: [] as unknown as [NodeOutputType],
    }
  }


  @get('/{game_hash}/{team_name}/next_comp', {
    responses: {
      '200': {
        description: 'return the next comp for a computation, if there are no free comps then choose a random one from the in-progress comps',
        //content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async getNextComp(    
    @param.path.string('game_hash') game_hash: string,
    @param.path.string('team_name') team_name: string,
  ): Promise<CompType> {
    
    return {
      id: "someID",
      comparing: [] as unknown as [number],
      result: [] as unknown as [number],
    }
  }


  @post('/{game_hash}/{team_name}/', {
    responses: {
      '200': {
        description: 'post given JSON input ',        
      },
    },
  })
  async postComp(
    @param.path.string('game_hash') game_hash: string,
    @param.path.string('team_name') team_name: string,
  ): Promise<string> {
    
    
    return "Yes"
  }


}
