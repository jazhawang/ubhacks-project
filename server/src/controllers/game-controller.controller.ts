
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

import { CompNode } from '../models';
import { CompNodeRepository, GameRepository, TeamRepository } from '../repositories';
import { NodeOutputType, CompType } from './types';

export class GameControllerController {
	constructor(
		@repository(CompNodeRepository)
		public compNodeRepository: CompNodeRepository,
		@repository(GameRepository)
		public gameRepository: GameRepository,
		@repository(TeamRepository)
		public teamRepository: TeamRepository,
	) { }

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
	): Promise<NodeOutputType[]> {
		const game = await this.gameRepository.findOne({ where: { game_hash } });
		if (game == null) {
			throw new Error("No game found");
		}

		const teamRoots = await Promise.all(
			game.team_ids.map(async (team_id) => {
				const team = await this.teamRepository.findById(team_id);
				return await this.findFullTree(team.root);
			})
		);

		return teamRoots

	}

	// takes a root id and finds the 'full' computation tree
	async findFullTree(rootId: string): Promise<NodeOutputType> {
		const rootCompNode = await this.compNodeRepository.findById(rootId);
		if (rootCompNode == null) {
			throw new Error("No root found");
		}

		let children;
		if (rootCompNode.children_ids == []) {
			children = [] as NodeOutputType[];
		} else {
			children = await Promise.all(rootCompNode.children_ids.map((child_id) => {
				return this.findFullTree(child_id);
			}));
		}

		return {
			id: rootCompNode.id,
			subarray: rootCompNode.subarray,
			merge_index: rootCompNode.merge_index,
			team_name: rootCompNode.team_name,
			children,
		}
	}


	@post('/{game_hash}/{team_name}/next_comp', {
		responses: {
			'200': {
				description: 'return the next comp for a computation, if there are no free comps then choose a random one from the in-progress comps',
			},
		},
	})
	async getNextComp(
		@param.path.string('game_hash') game_hash: string,
		@param.path.string('team_name') team_name: string,
	): Promise<CompType | null> {
		let game = await this.gameRepository.findOne({
			where: { game_hash: game_hash }
		});

		let team = await this.teamRepository.findOne({
			where: {
				game_id: game_hash,
				team_name: team_name
			}
		});

		if (game == null) {
			//throw new Error("No game hash found");
			game = await this.gameRepository.create({
        id: game_hash,
				game_hash,
				team_ids: [],
			});
		}

		console.log(team)

		if (!team) {
			console.log('creating node for new team')

			let node = await this.createNodeTree(game_hash, team_name, 8);

			console.log('creating team')

			team = await this.teamRepository.create({
				team_name,
				game_id: game_hash,
				root: node.id,
			});

			console.log(team)
			await this.gameRepository.updateById(game.id, {
				team_ids: game.team_ids.concat([team.id])
			})
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
					team_name: team_name,
				}
			});
			if (comp == null) {
				return null;
			}
		} else {
			// put the available comp to "waiting"
			await this.compNodeRepository.updateById(comp.id, { status: "waiting" });
		}

		// figure out the values for comparing assumes only two children
		const leftChild = await this.compNodeRepository.findById(comp.children_ids[0]);
		const rightChild = await this.compNodeRepository.findById(comp.children_ids[1]);

		// assume that if the left child is a leaf then the right child is a leaf
		return {
			id: comp.id!,
			comparing: [leftChild.subarray[leftChild.merge_index],
				rightChild.subarray[rightChild.merge_index]],
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
		@requestBody({
			content: {
				'application/json': {
					schema: {
						type: 'object',
						additionalProperties: false,
						properties: {
							id: { type: "string" },
							comparing: { type: "array", items: { type: "number" } },
              //result: { type: "array", items: { type: "number" } },
              swap: {type: "boolean"},
							team_name: { type: "string" },
						},
					},
				},
			},
		})
		comp: CompType,
	): Promise<string> {

		const game = await this.gameRepository.findOne({
			where: { game_hash: game_hash }
		});

		if (game == null) {
			throw new Error("No game hash found");
		}

		const compNode = await this.compNodeRepository.findById(comp.id);
		let leftChild = await this.compNodeRepository.findById(compNode.children_ids[0]);
		let rightChild = await this.compNodeRepository.findById(compNode.children_ids[1]);

		if (leftChild.status != "done" || rightChild.status != "done") {
			throw new Error("Children not done");
		}

		let toEnter, otherElem;
		if (comp.swap) { // the right is smaller
			await this.compNodeRepository.updateById(compNode.children_ids[1], {
				//...rightChild,
				merge_index: rightChild.merge_index + 1
			});
			toEnter = comp.comparing[1];
			otherElem = comp.comparing[0];
		} else { // left element is smaller
			await this.compNodeRepository.updateById(compNode.children_ids[0], {
				//...leftChild,
				merge_index: leftChild.merge_index + 1
			});
			toEnter = comp.comparing[0];
			otherElem = comp.comparing[1];
		}

		const getFirstNull = (arr: number[]) => {
			let i: number;
			for(i = 0; i < arr.length; i++) {
				if (!arr[i]) {
					return i;
				}
			}  
			throw new Error("Cannot write to subarray, all values in subarray are non-null");
		}
		// update the main subarray
		let sub = compNode.subarray;

		sub[getFirstNull(sub)] = toEnter;    

		// check if we are done for the subarray
		if (getFirstNull(sub) === leftChild.subarray.length + rightChild.subarray.length - 1) {      
			sub[getFirstNull(sub)] = otherElem;

			await this.compNodeRepository.updateById(comp.id, {
				subarray: sub,
				status: "done",
			});
			// we should update the other index, but i dont think we need to??

			// find the parent of this id
			const all = await this.compNodeRepository.find();
			const parent = all.filter((compNode: CompNode) => {
				return compNode.children_ids.includes(comp.id);
			});
			if (parent.length != 1) {
				throw new Error("bad parent number");
			}
			const soleParent = parent[0];

			// check if parent can be available
			if ((await this.compNodeRepository.findById(soleParent.children_ids[0])).status == "done" &&
				  (await this.compNodeRepository.findById(soleParent.children_ids[1])).status == "done") {
				await this.compNodeRepository.updateById(soleParent.id, {
					status: "available",
				});
			}
		} else {
			await this.compNodeRepository.updateById(comp.id, {
				subarray: sub,
			});
		}
		return "wow that worked?";
	}


	async createNodeTree(game_hash: string, team_name: string, arrayLength: number) {
		var numLayers = (Math.log(arrayLength) / Math.log(2)) + 1
		//make the tree and return the root
		const rootNode = await this.nodeTreeRecursive(game_hash, team_name, numLayers, 1, 1);
		await this.fillArrayBase(rootNode);
		return rootNode;
	}

	//return the root
	async nodeTreeRecursive(
		game_hash: string,
		team_name: string,
		numLayers: number,
		currentLayer: number,
		currentId: number): Promise<CompNode> {
		//create the subarray
		var arrayLength = Math.pow(2, (numLayers - currentLayer))
		var nodeSubarray = new Array(arrayLength);
		for (var i = 0; i < arrayLength; i++) {
			nodeSubarray[i] = null;
		}

		const makeId = (n: number) => 
		`${game_hash},${team_name},${n}`;

		if (currentLayer == numLayers) {
			//the base case if at the leaf
			let node = await this.compNodeRepository.create({
				game_id: game_hash,
				merge_index: 0,
				subarray: nodeSubarray,
				team_name: team_name,
				id: makeId(currentId),
				status: "blocked",
				children_ids: [],
			});
			return node
		}

		//call the function recursively
		//left child
		var leftId = currentId * 2
		await this.nodeTreeRecursive(game_hash, team_name, numLayers, currentLayer + 1, currentId * 2);
		//right child
		var rightId = currentId * 2 + 1
		await this.nodeTreeRecursive(game_hash, team_name, numLayers, currentLayer + 1, currentId * 2 + 1);

		//create the node
		let node = await this.compNodeRepository.create({
			game_id: game_hash,
			merge_index: 0,
			subarray: nodeSubarray,
			team_name: team_name,
			id: makeId(currentId),
			status: "blocked",
			children_ids: [makeId(leftId), makeId(rightId)],
		});
		return node
	}

	async fillArrayBase(root: CompNode){
		const makeId = (n: number) => 
			`${root.game_id},${root.team_name},${n}`;

		//the first index of the leaves is equal to the length of the array
		const firstIndex = root.subarray.length
		const numberOfChildren = firstIndex//recall that first index also equals the length of the array
		//get a shuffled array of numbers
		const shuffledArray = this.randomArray(numberOfChildren)

		let counter = 0;
		//go through each index of the leaves and set the subarray of each leaf to contain a number from the shuffled array 
		for (let i = firstIndex; i < firstIndex + numberOfChildren; i++) {
			await this.compNodeRepository.updateById(makeId(i), {
        subarray: [shuffledArray[counter] + 1],
        status: "done",
			});
			// Set the parent to available
			const parentI = Math.floor(i / 2);
			await this.compNodeRepository.updateById(makeId(parentI), {
				status: 'available',
			});

			counter++;
		}
		return true;
	}

	randomArray(n: number): number[] {
		const a = [...new Array(n)].map((_, i) => i)
		for (let i = 1; i < n; i++) {
			const j = Math.floor(Math.random() * (n - i)) + i
			const t = a[i]
			a[i] = a[j]
			a[j] = t
		}
		return a
	}
}

