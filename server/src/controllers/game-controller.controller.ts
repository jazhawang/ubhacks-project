
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
import {CompNodeRepository, GameRepository, TeamRepository} from '../repositories';
import {NodeOutputType, CompType} from './types';

export class GameControllerController {
  constructor(
    @repository(CompNodeRepository)
    public compNodeRepository : CompNodeRepository,
    @repository(GameRepository)
    public gameRepository : GameRepository,
    @repository(TeamRepository)
    public teamRepository : TeamRepository,
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
      children: [],
    }
  }


  @post('/{game_hash}/{team_name}/next_comp', {
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
    
    
    let game = await this.gameRepository.findOne({
      where: {game_hash: game_hash}
    });
    
    if (game == null) {
		//throw new Error("No game hash found");
		game = await this.gameRepository.create({
			game_hash
		});
	}

	  let team = await this.teamRepository.findOne({
		  where: {game_id: game_hash, team_name}
	  });

	  console.log(team)

	  if (!team) {
		console.log('creating node for new team')

		  let node = await this.compNodeRepository.create({
			game_id: game_hash,
			merge_index: 0,
			subarray: [null, null, null, null],
			team_name,
		  });

		console.log('creating team')

		  team = await this.teamRepository.create({
		  	team_name,
		  	game_id: game_hash,
			root: node.id,
		  });

		  console.log(team)
	  }

    // try to get an action comp which is available
    let comp = await this.compNodeRepository.findOne({
      where: {
        game_id: game.id, 
        status: "available",
        team_name: team_name,
      }
    });

     // no available comps
    if (comp == null) {
      comp = await this.compNodeRepository.findOne({
        where: {
          game_id: game.id,
          status: "waiting",
        }
      });
      if (comp == null) {
        throw new Error("no comp that is either available or waiting");
      }
    } else {
      // put the available comp to "waiting"
      await this.compNodeRepository.updateById(comp.id, {status: "waiting"});
    }

    // figure out the values for comparing assumes only two children
    const leftChild = await this.compNodeRepository.findById(comp.children_ids[0]);
    const rightChild = await this.compNodeRepository.findById(comp.children_ids[1]);

    // assume that if the left child is a leaf then the right child is a leaf    
    return {
      id: comp.id!,
      comparing: [leftChild.subarray[leftChild.merge_index] as number, 
                  rightChild.subarray[rightChild.merge_index] as number],
    };
  }


  @post('/{game_hash}/{team_name}/', {
    responses: {
      '200': {
        description: 'post given JSON input',        
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
