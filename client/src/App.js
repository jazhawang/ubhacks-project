import React, { useEffect, useState } from 'react'

import { Node } from './tree'
import { Modal } from './modal'

import './App.css'

function randomArray(n) {
	const a = [...new Array(n)].map((_, i) => i)
	for (let i = 1; i < n; i++) {
		const j = Math.floor(Math.random() * (n - i)) + i
		const t = a[i]
		a[i] = a[j]
		a[j] = t
	}
	return a
}

function makeNode(n) {
	let nodes = randomArray(n).map(v => ({ subarray: [v], mergeIndex: 0 }))

	while (nodes.length > 1) {
		const newNodes = []
		for (let i = 0; i < nodes.length; i += 2) {
			newNodes.push({
				subarray: new Array(nodes[i].subarray.length * 2).fill(null),
				mergeIndex: 0,
				children: [nodes[i], nodes[i+1]],
			})
		}
		nodes = newNodes
	}

	return nodes[0]
}

function randomIterate(node) {
	const next = node.subarray.indexOf(null)
	if (next === -1) return

	if (node.children.every(child => child.subarray.indexOf(null) < 0)) {
		// Merge!
		const vals = node.children.map(child => child.mergeIndex > (child.subarray.length - 1) ? Infinity : child.subarray[child.mergeIndex])
		let childI = vals[0] < vals[1] ? 0 : 1
		let child = node.children[childI]
		node.subarray[next] = child.subarray[child.mergeIndex]
		child.mergeIndex++
	} else {
		const child = node.children[Math.floor(Math.random() * 2)]
		randomIterate(child)
	}
}

function countProgress(node) {
	const size = node.subarray.reduce((count, v) => typeof v === 'number' ? count + 1 : count, 0)
	return size + (node.children ? node.children.reduce((count, child) => count + countProgress(child), 0) : 0)
}

const initialNodes = [makeNode(8), makeNode(8)]
initialNodes[0].color = 'red'
initialNodes[1].color = 'blue'

function App() {
	const [nodes, setNodes] = useState(initialNodes);

	const [comparison, setComparison] = useState([6, 5]);

	useEffect(() => {
		const interval = setInterval(() => {
			setNodes(nodes.map(node => {
				randomIterate(node)
				return node
			}))
		}, 1000)
		return () => clearInterval(interval)
	}, [nodes])

	const onSelect = (value) => {
		setComparison(null);
	}

	const sortedNodes = nodes.slice().sort((a, b) =>
		countProgress(b) - countProgress(a))

	return (
		<div className="App">
			<header className="App-header">
			{ sortedNodes.map((node) => (
				<div className={node.color}>
					<div className="tree-container">
						{ Node(node) }
					</div>
				</div>
			)) }
			</header>
			{ comparison && <Modal comparing={comparison} onSelect={onSelect}/> }
		</div>
	)
}

export default App
