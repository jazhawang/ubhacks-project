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

export class CompNodeControllerController {
  constructor(
    @repository(CompNodeRepository)
    public compNodeRepository : CompNodeRepository,
  ) {}

  @post('/comp-nodes', {
    responses: {
      '200': {
        description: 'CompNode model instance',
        content: {'application/json': {schema: getModelSchemaRef(CompNode)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompNode, {
            title: 'NewCompNode',
            exclude: ['id'],
          }),
        },
      },
    })
    compNode: Omit<CompNode, 'id'>,
  ): Promise<CompNode> {
    return this.compNodeRepository.create(compNode);
  }

  @get('/comp-nodes/count', {
    responses: {
      '200': {
        description: 'CompNode model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(CompNode)) where?: Where<CompNode>,
  ): Promise<Count> {
    return this.compNodeRepository.count(where);
  }

  @get('/comp-nodes', {
    responses: {
      '200': {
        description: 'Array of CompNode model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CompNode)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(CompNode)) filter?: Filter<CompNode>,
  ): Promise<CompNode[]> {
    return this.compNodeRepository.find(filter);
  }

  @patch('/comp-nodes', {
    responses: {
      '200': {
        description: 'CompNode PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompNode, {partial: true}),
        },
      },
    })
    compNode: CompNode,
    @param.query.object('where', getWhereSchemaFor(CompNode)) where?: Where<CompNode>,
  ): Promise<Count> {
    return this.compNodeRepository.updateAll(compNode, where);
  }

  @get('/comp-nodes/{id}', {
    responses: {
      '200': {
        description: 'CompNode model instance',
        content: {'application/json': {schema: getModelSchemaRef(CompNode)}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<CompNode> {
    return this.compNodeRepository.findById(id);
  }

  @patch('/comp-nodes/{id}', {
    responses: {
      '204': {
        description: 'CompNode PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CompNode, {partial: true}),
        },
      },
    })
    compNode: CompNode,
  ): Promise<void> {
    await this.compNodeRepository.updateById(id, compNode);
  }

  @put('/comp-nodes/{id}', {
    responses: {
      '204': {
        description: 'CompNode PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() compNode: CompNode,
  ): Promise<void> {
    await this.compNodeRepository.replaceById(id, compNode);
  }

  @del('/comp-nodes/{id}', {
    responses: {
      '204': {
        description: 'CompNode DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.compNodeRepository.deleteById(id);
  }
}
